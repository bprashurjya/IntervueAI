"use client"
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSession } from '@/utils/GeminiAIModal';
import { LoaderCircle } from 'lucide-react';
import { MockInterview } from '@/utils/schema';
import moment from 'moment';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/db';
import { useRouter } from 'next/navigation';

function AddNewInterview() {
    const [openDialog, setOpenDialog] = useState(false);
    const [jobPosition, setJobPosition] = useState('');
    const [jobDesc, setJobDesc] = useState('');
    const [jobExperience, setJobExperience] = useState('');
    const [loading, setLoading] = useState(false);
    const [jsonResponse, setJsonResponse] = useState([]);
    const { user } = useUser();
    const router = useRouter();

    const onSubmit = async (e) => {
        e.preventDefault();



        setLoading(true);

        try {
            const InputPrompt = `Job Position: ${jobPosition} , Job Description: ${jobDesc} , Job Experience: ${jobExperience}.

            system_instruction: Generate ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions and answers.
            
            [
              {question: "PLACEHOLDER_QUESTION", answer: "PLACEHOLDER_ANSWER"}
            ]`;
            

            const result = await chatSession.sendMessage(InputPrompt);
            const responseText = result.response.text();
            // console.log(responseText);

           

            const cleanedResponseText = responseText.replace('```json','').replace('```','')
            const parsedJsonResp = JSON.parse(cleanedResponseText);

            setJsonResponse(cleanedResponseText);
            console.log(parsedJsonResp)

            if (parsedJsonResp) {
                const resp = await db.insert(MockInterview)
                    .values({
                        mockId: uuidv4(),
                        jsonMockresp: cleanedResponseText,
                        jobPosition,
                        jobDesc,
                        jobExperience,
                        createdBy: user?.primaryEmailAddress?.emailAddress,
                        createdAt: moment().format('DD-MM-yyyy')
                    })
                    .returning({ mockId: MockInterview.mockId });

                console.log("Inserted ID:", resp);
                if (resp) {
                    setOpenDialog(false);
                    router.push(`/dashboard/interview/${resp[0]?.mockId}`);
                }
            } else {
                console.log("error");
            }
        } catch (error) {
            console.error("Error during submission:", error);
            alert("An error occurred while generating interview questions. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div>
            <div className='p-10 border rounded-lg bg-secondary
                hover:scale-105 hover:shadow-md cursor-pointer transition-all'
                onClick={() => setOpenDialog(true)}
            >
                <h2 className='text-lg text-center'>+Add New</h2>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader >
                        <DialogTitle className='text-2xl' >Tell us More About the Job you are Interviewing</DialogTitle>
                        <DialogDescription>
                            <form onSubmit={onSubmit}>
                                <div>
                                    <h2>Add Details about your job position/role, Job description and years of Experience</h2>
                                    <div className='mt-7 my-2'>
                                        <label>Job Role/Job Position</label>
                                        <Input
                                            placeholder='Ex. Full Stack Developer'
                                            value={jobPosition}
                                            required
                                            onChange={(event) => setJobPosition(event.target.value)}
                                        />
                                    </div>
                                    <div className='mt-7 my-2'>
                                        <label>Job Description/ Tech Stack (In short)</label>
                                        <Textarea
                                            placeholder='Ex. React Angular NodeJs Mysql'
                                            value={jobDesc}
                                            required
                                            onChange={(event) => setJobDesc(event.target.value)}
                                        />
                                    </div>
                                    <div className='mt-7 my-2'>
                                        <label>Years of Experience</label>
                                        <Input
                                            placeholder='Ex. 3'
                                            type='number'
                                            value={jobExperience}
                                            required
                                            onChange={(event) => setJobExperience(event.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className='flex gap-5 justify-end'>
                                    <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ?
                                            <>
                                                <LoaderCircle className='animate-spin' />'Generating from AI'
                                            </> : 'Start Interview'
                                        }
                                    </Button>
                                </div>
                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddNewInterview;
