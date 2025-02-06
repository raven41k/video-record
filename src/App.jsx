
import './App.css';

import React, { useState, useRef } from 'react';
import { Camera, StopCircle, Video } from 'lucide-react';

const App = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);

    const startRecording = async () => {
        try {
            // Получаем доступ к камере
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true,
                audio: true 
            });
            
            streamRef.current = stream;
            videoRef.current.srcObject = stream;

            // Создаем MediaRecorder
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                setRecordedChunks(chunks);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach(track => track.stop());
        setIsRecording(false);
    };

    const downloadVideo = () => {
        if (recordedChunks.length === 0) return;

        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        a.href = url;
        a.download = 'recording.webm';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4 max-w-xl mx-auto App">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-64 bg-gray-100 rounded-lg mb-4"
                />
                
                <div className="flex justify-center gap-4">
                    {!isRecording ? (
                        <button
                         onClick={startRecording}
                         className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                                <Camera className="mr-2" />
                                Start Recording
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            <StopCircle className="mr-2" />
                            Stop Recording
                        </button>
                    )}
                    
                    {recordedChunks.length > 0 && (
                        <button
                            onClick={downloadVideo}
                            className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            <Video className="mr-2" />
                            Download Recording
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};



export default App;
