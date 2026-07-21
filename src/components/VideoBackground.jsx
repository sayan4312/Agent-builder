import React from 'react';

export default function VideoBackground() {
  return (
    <div className="video-bg-container">
      <video 
        className="video-bg" 
        autoPlay 
        loop 
        muted 
        playsInline 
        poster="/frame_001.jpg"
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Dual opacity overlay gradient ensuring text readability on left while keeping right character view sharp */}
      <div className="video-overlay" />
    </div>
  );
}
