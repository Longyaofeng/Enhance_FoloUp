import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Interviewer } from "@/types/interviewer";
import Modal from "@/components/dashboard/Modal";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";

interface InterviewerCardProps {
  interviewer: Interviewer;
}

const InterviewerCard = ({ interviewer }: InterviewerCardProps) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  return (
    <>
      <Card
        className="relative p-0 mt-4 inline-block cursor-pointer h-60 w-56 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-md hover:shadow-lg transition-shadow"
        onClick={() => setShowDetailsModal(true)}
      >
        <CardContent className="p-0">
          <div className="w-full h-40 overflow-hidden flex items-center justify-center">
            <Image
              src={interviewer.image}
              alt={`Picture of ${interviewer.name}`}
              width={200}
              height={200}
              className="w-full h-full object-cover object-center"
              priority
            />
          </div>
          <div className="p-4">
            <CardTitle className="text-center text-lg mb-2 text-gray-800">
              {interviewer.name}
            </CardTitle>
            <div className="flex justify-center gap-4 text-sm text-gray-600">
              <span>E: {interviewer.empathy / 10}</span>
              <span>S: {interviewer.speed / 10}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={showDetailsModal}
        closeOnOutsideClick={true}
        onClose={() => setShowDetailsModal(false)}
      >
        <InterviewerDetailsModal 
          interviewer={interviewer} 
          onClose={() => setShowDetailsModal(false)} 
        />
      </Modal>
    </>
  );
};

export default InterviewerCard;
