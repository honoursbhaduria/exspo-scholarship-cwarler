import React, { useState, useEffect } from 'react';
import { useLottie } from 'lottie-react';

const LottieRenderer: React.FC<{ data: any }> = ({ data }) => {
  const { View } = useLottie({
    animationData: data,
    loop: true,
    autoplay: true,
    style: { width: '100%', height: '100%' },
  });
  return <>{View}</>;
};

export const KnowledgeLogo: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/knowledge-icon.json')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error('Failed to load knowledge-icon.json:', err));
  }, []);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {data ? <LottieRenderer data={data} /> : null}
    </div>
  );
};
