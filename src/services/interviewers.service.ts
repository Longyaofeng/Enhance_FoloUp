import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export const DEFAULT_INTERVIEWERS = {
  LISA: {
    name: "Explorer Lisa",
    image: "/interviewers/Lisa.png",
    description: "Hi! I'm Lisa, an enthusiastic and empathetic interviewer who loves to explore. With a perfect balance of empathy and rapport, I delve deep into conversations while maintaining a steady pace. Let's embark on this journey together and uncover meaningful insights!",
  },
  BOB: {
    name: "Empathetic Bob",
    image: "/interviewers/Bob.png",
    description: "Hi! I'm Bob, your go-to empathetic interviewer. I excel at understanding and connecting with people on a deeper level, ensuring every conversation is insightful and meaningful. With a focus on empathy, I'm here to listen and learn from you. Let's create a genuine connection!",
  },
};

const getAllInterviewers = async (clientId: string = "") => {
  try {
    const { data: clientData, error: clientError } = await supabase
      .from("interviewer")
      .select(`*`);

    if (clientError) {
      console.error(
        `Error fetching interviewers for clientId ${clientId}:`,
        clientError,
      );

      return [];
    }

    return clientData || [];
  } catch (error) {
    console.log(error);

    return [];
  }
};

const createInterviewer = async (payload: any) => {
  try {
    // Check for existing interviewer with the same name
    const { data: existingInterviewer, error: checkError } = await supabase
      .from("interviewer")
      .select("*")
      .eq("name", payload.name)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing interviewer:", checkError);
      throw new Error(`Error checking existing interviewer: ${checkError.message}`);
    }

    if (existingInterviewer) {
      console.error("An interviewer with this name already exists");
      throw new Error("An interviewer with this name already exists");
    }

    // Create new interviewer
    const { error, data } = await supabase
      .from("interviewer")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Error creating interviewer:", error);
      throw new Error(`Error creating interviewer: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in createInterviewer:", error);
    throw error;
  }
};

const getInterviewer = async (interviewerId: bigint) => {
  const { data: interviewerData, error: interviewerError } = await supabase
    .from("interviewer")
    .select("*")
    .eq("id", interviewerId)
    .single();

  if (interviewerError) {
    console.error("Error fetching interviewer:", interviewerError);

    return null;
  }

  return interviewerData;
};

const deleteInterviewer = async (interviewerId: bigint) => {
  try {
    // 1. 首先获取所有相关的面试记录
    const { data: interviews, error: fetchError } = await supabase
      .from("interview")
      .select("id")
      .eq("interviewer_id", interviewerId);

    if (fetchError) {
      console.error("Error fetching related interviews:", fetchError);
      throw new Error(`Error fetching related interviews: ${fetchError.message}`);
    }

    // 2. 删除每个面试相关的回复记录
    for (const interview of interviews || []) {
      const { error: responseError } = await supabase
        .from("response")
        .delete()
        .eq("interview_id", interview.id);

      if (responseError) {
        console.error("Error deleting responses:", responseError);
        throw new Error(`Error deleting responses: ${responseError.message}`);
      }
    }

    // 3. 删除面试记录
    const { error: interviewError } = await supabase
      .from("interview")
      .delete()
      .eq("interviewer_id", interviewerId);

    if (interviewError) {
      console.error("Error deleting interviews:", interviewError);
      throw new Error(`Error deleting interviews: ${interviewError.message}`);
    }

    // 4. 最后删除面试官
    const { error: interviewerError } = await supabase
      .from("interviewer")
      .delete()
      .eq("id", interviewerId);

    if (interviewerError) {
      console.error("Error deleting interviewer:", interviewerError);
      throw new Error(`Error deleting interviewer: ${interviewerError.message}`);
    }

    return true;
  } catch (error) {
    console.error("Error in deleteInterviewer:", error);
    throw error;
  }
};

export const InterviewerService = {
  getAllInterviewers,
  createInterviewer,
  getInterviewer,
  deleteInterviewer,
};
