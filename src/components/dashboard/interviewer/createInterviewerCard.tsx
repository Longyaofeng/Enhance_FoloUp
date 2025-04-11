"use client";

import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Image as LucideImage, Plus, Upload } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import Modal from "@/components/dashboard/Modal";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInterviewers } from "@/contexts/interviewers.context";
import { useClerk } from "@clerk/nextjs";
import { InterviewerService } from "@/services/interviewers.service";
import Retell from "retell-sdk";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

const defaultAvatars = [
  { path: "/interviewers/Lisa.png", name: "Lisa" },
  { path: "/interviewers/Bob.png", name: "Bob" },
];

const createInterviewerCard = () => {
  const [open, setOpen] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [name, setName] = useState("");
  const [empathy, setEmpathy] = useState(0.4);
  const [rapport, setRapport] = useState(0.7);
  const [exploration, setExploration] = useState(0.2);
  const [speed, setSpeed] = useState(0.9);
  const [image, setImage] = useState("");
  const [voiceId, setVoiceId] = useState("11labs-Brian");
  const { createInterviewer, refreshInterviewers } = useInterviewers();
  const { user } = useClerk();
  const [isClicked, setIsClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [avatars, setAvatars] = useState(defaultAvatars);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setName("");
      setEmpathy(0.4);
      setRapport(0.7);
      setExploration(0.2);
      setSpeed(0.9);
      setImage("");
      setVoiceId("11labs-Brian");
    }
  }, [open]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setImage(url);
      setSelectedAvatar(url);
      setGallery(false);
    }
  };

  const onSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required fields
      if (!name || !image) {
        setError("Please fill in all required fields");
        return;
      }

      let finalImagePath = image;
      
      // Handle image upload if a new image was uploaded
      if (uploadedImage) {
        console.log('Starting image upload...');
        const formData = new FormData();
        formData.append('image', uploadedImage);
        
        const uploadResponse = await fetch('/api/upload-avatar', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          console.error('Image upload failed:', errorData);
          throw new Error(`Image upload failed: ${errorData.error || 'Unknown error'}`);
        }
        
        const { imagePath } = await uploadResponse.json();
        finalImagePath = imagePath;
        console.log('Image upload successful:', finalImagePath);
      }

      console.log('Creating LLM model...');
      // Create new LLM model through API
      const modelResponse = await fetch('/api/create-interviewer-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewer: {
            name: name,
            empathy: empathy * 10,
            rapport: rapport * 10,
            exploration: exploration * 10,
            speed: speed * 10,
            description: `A custom interviewer with empathy ${empathy * 10}, rapport ${rapport * 10}, exploration ${exploration * 10}, and speed ${speed * 10}`,
          }
        }),
      });

      if (!modelResponse.ok) {
        const errorData = await modelResponse.json();
        console.error('Model creation failed:', errorData);
        throw new Error(`Model creation failed: ${errorData.error || 'Unknown error'}`);
      }

      const modelData = await modelResponse.json();
      console.log('LLM model created successfully:', modelData);

      console.log('Creating agent...');
      // Create new Agent through API
      const agentResponse = await fetch('/api/create-interviewer-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          llm_id: modelData.llm_id,
          voice_id: voiceId,
          agent_name: name,
        }),
      });

      if (!agentResponse.ok) {
        const errorData = await agentResponse.json();
        console.error('Agent creation failed:', errorData);
        throw new Error(`Agent creation failed: ${errorData.error || 'Unknown error'}`);
      }

      const agentData = await agentResponse.json();
      console.log('Agent created successfully:', agentData);

      console.log('Creating interviewer in database...');
      // Create new interviewer in database using the context's createInterviewer method
      const interviewerData = {
        name: name,
        image: finalImagePath,
        voice: voiceId,
        model: modelData.llm_id,
        empathy: empathy * 10,
        rapport: rapport * 10,
        exploration: exploration * 10,
        speed: speed * 10,
        user_id: user?.id,
        agent_id: agentData.agent_id,
        description: `A custom interviewer with empathy ${empathy * 10}, rapport ${rapport * 10}, exploration ${exploration * 10}, and speed ${speed * 10}`,
      };
      console.log('Interviewer data:', interviewerData);

      await createInterviewer(interviewerData);

      setSuccess("Interviewer created successfully!");
      setName("");
      setImage("");
      setUploadedImage(null);
      setPreviewUrl("");
      setEmpathy(0.4);
      setRapport(0.7);
      setExploration(0.2);
      setSpeed(0.9);
      setVoiceId("11labs-Brian");
      setSelectedAvatar("");
      await refreshInterviewers();
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
      }, 2000);
    } catch (error) {
      console.error("Detailed error creating interviewer:", error);
      if (error instanceof Error) {
        setError(`Failed to create interviewer: ${error.message}`);
      } else {
        setError("Failed to create interviewer. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Plus
        size={30}
        strokeWidth={2}
        className="cursor-pointer bg-indigo-600 rounded-full text-white"
        onClick={() => setOpen(true)}
      />
      <Modal
        open={open}
        closeOnOutsideClick={true}
        onClose={() => {
          setOpen(false);
          setSuccess(null);
          setError(null);
        }}
      >
        <div className="text-center w-[40rem]">
          <CardTitle className="text-2xl text mt-0 mb-4 p-0 font-semibold">
            Create Custom Interviewer
          </CardTitle>
          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <div className="mt-3 p-2 flex flex-row justify-center space-x-10 items-center">
            <div
              className="flex flex-col items-center justify-center overflow-hidden border-4 border-gray-500 rounded-xl h-56 w-52"
              onClick={() => setGallery(true)}
            >
              {image ? (
                <Image
                  src={image}
                  alt="Picture of the interviewer"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover object-center"
                  priority
                />
              ) : (
                <div>
                  <LucideImage
                    className="mt-3 text-gray-300"
                    size={100}
                    strokeWidth={0.7}
                  />
                  <h4 className="text-xs text-center font-medium text-gray-400">
                    Select Avatar
                  </h4>
                </div>
              )}
            </div>
            <div className="flex flex-col items-start space-y-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter interviewer name"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Empathy
                </label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[empathy]}
                    onValueChange={([value]) => setEmpathy(value)}
                    max={1}
                    step={0.1}
                    className="w-48"
                  />
                  <span className="text-sm text-gray-500">{empathy}</span>
                </div>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Rapport
                </label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[rapport]}
                    onValueChange={([value]) => setRapport(value)}
                    max={1}
                    step={0.1}
                    className="w-48"
                  />
                  <span className="text-sm text-gray-500">{rapport}</span>
                </div>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Exploration
                </label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[exploration]}
                    onValueChange={([value]) => setExploration(value)}
                    max={1}
                    step={0.1}
                    className="w-48"
                  />
                  <span className="text-sm text-gray-500">{exploration}</span>
                </div>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Speed
                </label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[speed]}
                    onValueChange={([value]) => setSpeed(value)}
                    max={1}
                    step={0.1}
                    className="w-48"
                  />
                  <span className="text-sm text-gray-500">{speed}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={isLoading}
              className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Avatar Gallery Modal */}
      <Modal
        open={gallery}
        closeOnOutsideClick={true}
        onClose={() => setGallery(false)}
      >
        <div className="w-[40rem] p-6">
          <CardTitle className="text-2xl mb-4">Select Avatar</CardTitle>
          <div className="grid grid-cols-3 gap-4">
            {avatars.map((avatar) => (
              <div
                key={avatar.path}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-4 ${
                  selectedAvatar === avatar.path
                    ? "border-indigo-500"
                    : "border-gray-200"
                }`}
                onClick={() => {
                  setImage(avatar.path);
                  setSelectedAvatar(avatar.path);
                  setGallery(false);
                }}
              >
                <Image
                  src={avatar.path}
                  alt={avatar.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="relative cursor-pointer rounded-lg overflow-hidden border-4 border-gray-200">
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Upload Image</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default createInterviewerCard;
