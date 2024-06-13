'use client'
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { Lightbulb, WebcamIcon } from 'lucide-react'
import Link from 'next/link'

import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'

function Interview({ params }) {
    useEffect(() => {
        console.log(params.interviewId)
        GetInterviewDetails();
    }, [])

    const [interviewData, setInterviewData] = useState(null);
    const [webCamEnabled, setWebCamEnabled] = useState(false);

    const GetInterviewDetails = async () => {
        const result = await db.select().from(MockInterview)
            .where(eq(MockInterview.mockId, params.interviewId))

        setInterviewData(result[0]);
        console.log(result);
    }

    return (
        <div className='my-10 '>
            <h2 className='font-bold text-2xl'>Lets Get started</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                <div className='flex flex-col my-5 gap-5'>
                    <div className='flex flex-col p-5 rounded border gap-5'>
                        <h2 className='text-lg'><strong>Job Role/Position : </strong> {interviewData ? interviewData.jobPosition : 'Loading...'}</h2>
                        <h2 className='text-lg'><strong>Job description/Tech Stacks : </strong>{interviewData ? interviewData.jobDesc : 'Loading...'}</h2>
                        <h2 className='text-lg'><strong>Years of experience : </strong>{interviewData ? interviewData.jobExperience: 'Loading...'}</h2>
                    </div>
                    <div className='p-5 border rounded-lg border-yellow-300 bg-yellow-100'>
                        <h2 className='flex gap-2 items-center text-yellow-500'><Lightbulb /> <strong>Information</strong></h2>
                        <h2 className='mt-3 text-yellow-400'>{process.env.NEXT_PUBLIC_INFORMATION}</h2>
                    </div>
                </div>
            </div>

            <div>
                {webCamEnabled ?
                    <Webcam
                        onUserMedia={() => setWebCamEnabled(true)}
                        onUserMediaError={() => setWebCamEnabled(false)}
                        mirrored={true}
                        style={{
                            height: 300,
                            width: 300
                        }}
                    />
                    :
                    <>
                        <WebcamIcon className='h-72 w-full my-7 p-20 bg-secondary rounded-lg border' />
                        <Button variant="ghost" className="w-full" onClick={() => setWebCamEnabled(true)}>Enable Web Cam</Button>
                    </>
                }
            </div>

            <div className='flex justify-end items-end'>
                <Link href={'/dashboard/interview/' + params.interviewId + '/start'}>
                    <Button>Start Interview</Button>
                </Link>
            </div>
        </div>
    )
}

export default Interview;
