export default function FeedbackCard({ praise, improvement, actionGuide }) {
  const sections = [
    { title: '잘한 점', content: praise, bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '👏' },
    { title: '개선 방향', content: improvement, bg: 'bg-amber-50', border: 'border-amber-200', icon: '💡' },
    { title: '다음 단계', content: actionGuide, bg: 'bg-blue-50', border: 'border-blue-200', icon: '🚀' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sections.map(s => (
        <div key={s.title} className={`${s.bg} border ${s.border} rounded-lg p-4`}>
          <h4 className="font-semibold mb-2">{s.icon} {s.title}</h4>
          <p className="text-sm leading-relaxed">{s.content || '정보 없음'}</p>
        </div>
      ))}
    </div>
  );
}
