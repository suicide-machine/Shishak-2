import { Appointment } from "@/store/appointmentStore"
import React, { useCallback, useRef } from "react"
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt"

interface AppointmentCallInterface {
  appointment: Appointment
  currentUser: {
    id: string
    name: string
    role: "teacher" | "student"
  }
  onCallEnd: () => void
  joinAppointment: (appointmentId: string) => Promise<void>
}

const AppointmentCall = ({
  appointment,
  currentUser,
  onCallEnd,
  joinAppointment,
}: AppointmentCallInterface) => {
  const zpRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initializationRef = useRef(false)
  const isComponentMountedRef = useRef(true)

  const memoizedJoinConsultation = useCallback(
    async (appointmentId: string) => {
      await joinAppointment(appointmentId)
    },
    [joinAppointment],
  )

  const intializeCall = useCallback(
    async (container: HTMLDivElement) => {
      if (
        initializationRef.current ||
        zpRef.current ||
        !isComponentMountedRef.current
      ) {
        return
      }

      if (!container || !container.isConnected) {
        return
      }

      try {
        initializationRef.current = true
        const appId = process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID
        const serverSecret = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET

        if (!appId || !serverSecret) {
          throw new Error("Zegocloud credentials not configured")
        }

        const numericAppId = Number.parseInt(appId)

        if (isNaN(numericAppId)) {
          throw new Error("Invalid Zegocloud App Id")
        }

        try {
          await memoizedJoinConsultation(appointment?._id)
        } catch (error) {
          console.warn("failed to update appointment", error)
        }

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          numericAppId,
          serverSecret,
          appointment.zegoRoomId,
          currentUser.id,
          currentUser.name,
        )

        const zp = ZegoUIKitPrebuilt.create(kitToken)
        zpRef.current = zp

        const isVideoCall = appointment.appointmentType === "Video Appointment"

        zp.joinRoom({
          container,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          turnOnMicrophoneWhenJoining: true,
          showMyMicrophoneToggleButton: true,
          turnOnCameraWhenJoining: isVideoCall,
          showMyCameraToggleButton: isVideoCall,
          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,
          showRemoveUserButton: true,
          showPinButton: false,
          showAudioVideoSettingsButton: true,
          showTurnOffRemoteCameraButton: true,
          showTurnOffRemoteMicrophoneButton: true,
          maxUsers: 2,
          layout: "Auto",
          showLayoutButton: false,
          onJoinRoom: () => {
            if (isComponentMountedRef.current) {
              console.log(
                `Joined ${appointment.appointmentType} : ${appointment.zegoRoomId}`,
              )
            }
          },

          onLeaveRoom: () => {
            if (isComponentMountedRef.current) {
              if (zpRef.current) {
                try {
                  zpRef.current.mutePublishStreamAudio(true)
                  zpRef.current.mutePublishStreamVideo(true)
                } catch (error) {
                  console.warn("Error turning off camera/mircophone")
                }
              }
            }
          },

          onUserJoin: (users: any[]) => {
            if (isComponentMountedRef.current) {
              console.log("Users Joined", users)
            }
          },

          onUserLeave: (users: any[]) => {
            if (isComponentMountedRef.current) {
              console.log("Users left", users)
            }
          },

          showLeavingView: true,

          onReturnToHomeScreenClicked: () => {
            if (zpRef.current) {
              try {
                zpRef.current.mutePublishStreamAudio(true)
                zpRef.current.mutePublishStreamVideo(true)
              } catch (error) {
                console.warn("Error turning off camera/mircophone")
              }
            }
            onCallEnd()
          },
        })
      } catch (error) {
        console.error("Call Initilization failed", error)
        initializationRef.current = false
        if (isComponentMountedRef.current) {
          zpRef.current = null
          onCallEnd()
        }
      }
    },
    [
      appointment?._id,
      appointment.zegoRoomId,
      appointment.appointmentType,
      currentUser.id,
      currentUser.name,
      memoizedJoinConsultation,
      onCallEnd,
    ],
  )
  return <div>AppointmentCall</div>
}

export default AppointmentCall
