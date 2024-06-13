"use client"
import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic } from 'lucide-react';
import { chatSession } from '@/utils/GeminiAIModal';
import { toast } from 'sonner';
import { ChatSession } from '@google/generative-ai';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import moment from 'moment';
import { useUser } from '@clerk/nextjs';

function RecordAnswerSection({ mockInterviewQuestions, activeQuestionIndex, interviewData }) {
    const [userAnswer, setUserAnswer] = useState('');
    const user = useUser();
    const [loading, setLoading] = useState(false);
    const {
        error,
        interimResult,
        isRecording,
        setResults,
        results,
        startSpeechToText,
        stopSpeechToText,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });

    useEffect(() => {
        results.forEach((result) => {
            setUserAnswer(prevAns => prevAns + result.transcript);
        });
    }, [results]);

    useEffect(() => {
        if (!isRecording && userAnswer.length > 10) {
            UpdateUserAnswer();
        }
    }, [isRecording, userAnswer]);

    const StartStopRecording = async () => {
        if (isRecording) {
            stopSpeechToText();
            if (userAnswer.length < 10) {
                setLoading(false);
                toast.error('Error while saving your answer, please record again');
                return;
            }
        } else {
            startSpeechToText();
        }
    };

    const UpdateUserAnswer = async () => {
        console.log(userAnswer);
        setLoading(true);
       
        const feedbackPrompt = `Question: ${mockInterviewQuestions[activeQuestionIndex]?.question}, User Answer: ${userAnswer}, Please give us rating and feedback as area of improvement if any in just 3-5 lines in JSON format to improve it with rating field and feedback field`;
        const result = await chatSession.sendMessage(feedbackPrompt);
        const mockJsonResp = (result.response.text()).replace('```json', '').replace('```', '');
        const JsonFeedbackresp = JSON.parse(mockJsonResp);
        
        const resp = await db.insert(UserAnswer).values({
            mockIdRef: interviewData?.mockId,
            question: mockInterviewQuestions[activeQuestionIndex]?.question,
            correctAns: mockInterviewQuestions[activeQuestionIndex]?.answer,
            userAns: userAnswer,
            feedback: JsonFeedbackresp?.feedback,
            rating: JsonFeedbackresp?.rating,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format('DD-MM-yyyy')
        });

        if (resp) {
            toast('User Answer recorded successfully');
            setUserAnswer('');
            setResults([]);
        }
        setResults([]);
        setLoading(false);
    };

    return (
        <div className='flex items-center justify-center flex-col'>
            <div className='flex flex-col mt-20 justify-center bg-black items-center rounded-lg p-5'>
                <Image src={'/webcam.png'} width={200} height={200} alt='Webcam'
                    className='absolute' />
                <Webcam
                    mirrored={true}
                    style={{
                        height: 300,
                        width: '100%',
                        zIndex: 10,
                    }}
                />
            </div>
            <Button disabled={loading}
                variant='outline' className='my-10'
                onClick={StartStopRecording}
            >
                {isRecording ?
                    <h2 className='text-red-600 flex gap-2'>
                        <Mic /> 'Recording'
                    </h2>
                    :
                    'Record Answer'}
            </Button>
          
        </div>
    );
}

export default RecordAnswerSection;
