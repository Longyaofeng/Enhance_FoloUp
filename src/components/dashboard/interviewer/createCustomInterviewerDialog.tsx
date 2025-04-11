"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useInterviewers } from "@/contexts/interviewers.context";
import { AlertCircle, Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useState, type ChangeEvent, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_INTERVIEWERS } from "@/services/interviewers.service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const initialFormData = {
  name: "",
  description: "",
  empathy: 5,
  exploration: 5,
  rapport: 5,
  speed: 5,
  image: null as File | null,
  defaultImage: "",
};

export function CreateCustomInterviewerDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();
  const { createInterviewer, isAuthenticated } = useInterviewers();

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session found");
      } else {
        console.log("Session found:", session.user.id);
      }
    };

    initializeAuth();
  }, [supabase.auth]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file, defaultImage: "" });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDefaultImageSelect = (image: string, name: string, description: string) => {
    setFormData({
      ...formData,
      image: null,
      defaultImage: image,
      name,
      description,
    });
    setImagePreview(image);
  };

  const clearImage = () => {
    setFormData({ ...formData, image: null, defaultImage: "" });
    setImagePreview(null);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setImagePreview(null);
    setError(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setOpen(open);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.image && !formData.defaultImage) {
      setError("Image is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validateForm()) {
      return;
    }

    if (!isAuthenticated) {
      console.log("Authentication check failed");
      setError("请先登录后再创建面试官");
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          if (typeof value === "number") {
            data.append(key, value.toString());
          } else {
            data.append(key, value);
          }
        }
      });

      await createInterviewer(data);
      handleClose(false);
    } catch (error) {
      console.error("Error creating interviewer:", error);
      if (error instanceof Error) {
        if (error.message.includes("not authenticated") || error.message.includes("login")) {
          setError("请先登录后再创建面试官");
        } else {
          setError(error.message);
        }
      } else {
        setError("创建面试官失败，请重试");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Card className="p-0 inline-block cursor-pointer hover:scale-105 ease-in-out duration-300 h-40 w-36 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-md hover:shadow-lg hover:border-primary/50 transition-all">
          <CardContent className="p-0">
            <div className="w-full h-20 overflow-hidden flex justify-center items-center bg-gradient-to-br from-primary/5 to-primary/10">
              <Plus size={40} className="text-primary" />
            </div>
            <p className="my-3 mx-auto text-xs text-wrap w-fit text-center font-medium">
              Create Custom Interviewer
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create Custom Interviewer</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create your own interviewer with custom parameters.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right font-medium">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="col-span-3"
              placeholder="Enter interviewer name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="col-span-3"
              placeholder="Enter interviewer description"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Image</Label>
            <div className="col-span-3">
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  {Object.entries(DEFAULT_INTERVIEWERS).map(([key, interviewer]) => (
                    <div
                      key={key}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:shadow-md ${
                        formData.defaultImage === interviewer.image
                          ? "border-primary shadow-md"
                          : "border-transparent hover:border-primary/50"
                      }`}
                      onClick={() =>
                        handleDefaultImageSelect(
                          interviewer.image,
                          interviewer.name,
                          interviewer.description
                        )
                      }
                    >
                      <div className="relative w-16 h-16">
                        <Image
                          src={interviewer.image}
                          alt={interviewer.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="relative">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border shadow-sm">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 p-1 bg-background border rounded-full shadow-sm hover:bg-accent transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer flex items-center gap-2 border rounded-md p-2 hover:bg-accent transition-colors"
                  >
                    <Upload size={20} />
                    Upload Custom Image
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Empathy</Label>
            <div className="col-span-3">
              <Slider
                value={[formData.empathy]}
                onValueChange={([value]) =>
                  setFormData({ ...formData, empathy: value })
                }
                max={10}
                step={1}
                className="my-2"
              />
              <div className="text-right text-sm text-muted-foreground">
                {formData.empathy}/10
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Exploration</Label>
            <div className="col-span-3">
              <Slider
                value={[formData.exploration]}
                onValueChange={([value]) =>
                  setFormData({ ...formData, exploration: value })
                }
                max={10}
                step={1}
                className="my-2"
              />
              <div className="text-right text-sm text-muted-foreground">
                {formData.exploration}/10
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Rapport</Label>
            <div className="col-span-3">
              <Slider
                value={[formData.rapport]}
                onValueChange={([value]) =>
                  setFormData({ ...formData, rapport: value })
                }
                max={10}
                step={1}
                className="my-2"
              />
              <div className="text-right text-sm text-muted-foreground">
                {formData.rapport}/10
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Speed</Label>
            <div className="col-span-3">
              <Slider
                value={[formData.speed]}
                onValueChange={([value]) =>
                  setFormData({ ...formData, speed: value })
                }
                max={10}
                step={1}
                className="my-2"
              />
              <div className="text-right text-sm text-muted-foreground">
                {formData.speed}/10
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Creating..." : "Create Interviewer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
