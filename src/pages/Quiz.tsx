import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mbtiQuestions } from '../data/mbtiQuestions';
import {addUserInfo} from '../utils/localStorage';
import { Card, Button, Typography } from 'antd';

const { Title } = Typography;

export default function Quiz() {
  const [answers, setAnswers] = useState<string[]>([]);
  const navigate = useNavigate();

  const current = answers.length;
  const question = mbtiQuestions[current];

  const getMBTI = () => {
    const count: Record<string, number> = {};
    answers.forEach((t) => {
      count[t] = (count[t] || 0) + 1;
    });
    return (
      (count['I'] > count['E'] ? 'I' : 'E') +
      (count['S'] > count['N'] ? 'S' : 'N') +
      (count['T'] > count['F'] ? 'T' : 'F') +
      (count['J'] > count['P'] ? 'J' : 'P')
    );
  };

  const handleFinish = () => {
    const mbti = getMBTI();
    addUserInfo(mbti);
    navigate('/menu');
  };

  if (current === mbtiQuestions.length) {
    return (
      <div style={{ padding: 32 }}>
        <Title level={3}>Xác định MBTI hoàn tất!</Title>
        <Button type="primary" onClick={handleFinish}>
          Xem gợi ý từ MODA
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      <Card
        title={`Câu hỏi ${current + 1}`}
        style={{
          maxWidth: '100%',
          backgroundColor: '#f0f5ff',
          borderRadius: 8,
          border: '1px solid #d6e4ff',
        }}
      >
        <h2>{question.question}</h2>
        {question.options.map((opt, idx) => (
          <Button
          key={idx}
          onClick={() => setAnswers([...answers, opt.trait])}
          style={{
            margin: '8px 0',
            width: '100%',
            whiteSpace: 'normal',
            textAlign: 'center',
            padding: '12px 16px',
            lineHeight: 1.5,
            height: '10vh',
          }}
        >
          {opt.label}
        </Button>
        
        ))}
      </Card>
    </div>
  );
}
