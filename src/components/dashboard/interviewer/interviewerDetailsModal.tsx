import Image from "next/image";
import { CardTitle } from "@/components/ui/card";
import ReactAudioPlayer from "react-audio-player";
import { Interviewer } from "@/types/interviewer";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useInterviewers } from "@/contexts/interviewers.context";
import { useState } from "react";
import Modal from "@/components/dashboard/Modal";

interface Props {
  interviewer: Interviewer | undefined;
  onClose: () => void;
}

function InterviewerDetailsModal({ interviewer, onClose }: Props) {
  const { deleteInterviewer } = useInterviewers();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!interviewer) return;
    try {
      setIsDeleting(true);
      setError(null);
      await deleteInterviewer(interviewer.id);
      setShowDeleteModal(false);
      onClose();
    } catch (error) {
      console.error("Error deleting interviewer:", error);
      setError("Failed to delete interviewer. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="w-[40rem] p-6">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-semibold">
              {interviewer?.name}
            </CardTitle>
          </div>

          {/* Main Content */}
          <div className="flex space-x-8">
            {/* Left Column - Image */}
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48 rounded-xl overflow-hidden border-4 border-gray-200">
                <Image
                  src={interviewer?.image || ""}
                  alt="Picture of the interviewer"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right Column - Description and Audio */}
            <div className="flex-1">
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  {interviewer?.description}
                </p>
                {interviewer?.audio && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <ReactAudioPlayer src={`/audio/${interviewer.audio}`} controls />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Interviewer Settings
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Empathy</span>
                  <span className="font-medium">{(interviewer?.empathy || 10) / 10}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rapport</span>
                  <span className="font-medium">{(interviewer?.rapport || 10) / 10}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Exploration</span>
                  <span className="font-medium">{(interviewer?.exploration || 10) / 10}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Speed</span>
                  <span className="font-medium">{(interviewer?.speed || 10) / 10}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="destructive"
              className="flex items-center gap-2 float-right"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={16} />
              Delete Interviewer
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        closeOnOutsideClick={true}
        onClose={() => {
          setShowDeleteModal(false);
          setError(null);
        }}
      >
        <div className="w-[30rem] p-6">
          <div className="space-y-4">
            <CardTitle className="text-2xl font-semibold">
              Delete Interviewer
            </CardTitle>
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <p className="text-gray-600">
              Are you sure you want to delete the interviewer "{interviewer?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setError(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default InterviewerDetailsModal;
