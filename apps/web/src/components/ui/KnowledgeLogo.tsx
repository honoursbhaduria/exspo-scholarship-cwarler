import React from 'react';
import { useLottie } from 'lottie-react';
import knowledgeAnimation from '../../assets/knowledge-icon.json';

export const KnowledgeLogo: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => {
  const options = {
    animationData: knowledgeAnimation,
    loop: true,
    autoplay: true,
  };
  const { View } = useLottie(options);

  return <div className={`flex items-center justify-center ${className}`}>{View}</div>;
};
