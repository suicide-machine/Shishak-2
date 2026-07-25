"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { FileText, Save, X } from "lucide-react"
import { Button } from "../ui/button"
import { AlertTitle } from "../ui/alert"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (feedback: string, notes: string) => Promise<void>
  studentName: string
  loading?: boolean
}

const FeedbackModal = ({
  isOpen,
  onClose,
  onSave,
  studentName,
  loading,
}: FeedbackModalProps) => {
  const [feedback, setFeedback] = useState("")
  const [notes, setNotes] = useState("")

  if (!isOpen) return null

  const handleSave = async () => {
    try {
      await onSave(feedback, notes)
      setFeedback("")
      setNotes("")
    } catch (error) {
      console.error("Failed to save feedback")
    }
  }

  const handleClose = () => {
    setFeedback("")
    setNotes("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />

            <CardTitle>Complete Appointment</CardTitle>
          </div>

          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <AlertTitle className="w-5 h-5 text-blue-600 mt-0.5" />

            <div>
              <h3 className="font-semibold text-blue-900">
                Confirm Appointment Completion
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Are your sure you want to mark the appointment with{" "}
                <strong>{studentName}</strong> as completed?
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm font-medium">
              Feedback <span className="text-red-500">*</span>
            </Label>

            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback details, what you recommend to the student"
              rows={6}
              className="min-h-30"
              required
            />

            <p className="text-xs text-gray-500">Any special suggestion.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Additonal Notes (Optional)
            </Label>

            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about the appointment?"
              rows={4}
              className="min-h-30"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={!feedback.trim() || loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save to Complete
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FeedbackModal
