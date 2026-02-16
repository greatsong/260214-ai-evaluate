export default function ScoreTable({ scores, rubricItems }) {
  if (!scores) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="text-left p-3 font-semibold">평가 항목</th>
            <th className="text-center p-3 font-semibold w-20">점수</th>
            <th className="text-left p-3 font-semibold">근거 (Evidence)</th>
            <th className="text-left p-3 font-semibold">피드백</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(scores).map(([key, data]) => {
            const score = typeof data === 'object' ? data.score : data;
            const evidence = typeof data === 'object' ? data.evidence : '';
            const feedback = typeof data === 'object' ? data.feedback : '';
            const itemName = rubricItems?.[key]?.name || key;

            const scoreColor =
              score >= 4 ? 'text-emerald-600 bg-emerald-50' :
              score >= 3 ? 'text-blue-600 bg-blue-50' :
              score >= 2 ? 'text-amber-600 bg-amber-50' :
              'text-red-600 bg-red-50';

            return (
              <tr key={key} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium">{itemName}</td>
                <td className="p-3 text-center">
                  <span className={`inline-block w-8 h-8 leading-8 rounded-full font-bold text-sm ${scoreColor}`}>
                    {score}
                  </span>
                </td>
                <td className="p-3 text-slate-600 text-xs italic max-w-xs">{evidence}</td>
                <td className="p-3 text-slate-700 text-xs max-w-xs">{feedback}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
