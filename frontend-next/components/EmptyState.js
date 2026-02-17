/**
 * 빈 상태 표시 컴포넌트
 * @param {string} message - 표시할 메시지
 * @param {string} [icon] - 아이콘 텍스트
 * @param {string} [actionLabel] - 액션 버튼 라벨
 * @param {string} [actionHref] - 액션 버튼 링크
 */
export default function EmptyState({ message, icon, actionLabel, actionHref }) {
  return (
    <div className="text-center py-8">
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <p className="text-sm text-slate-400">{message}</p>
      {actionLabel && actionHref && (
        <a href={actionHref} className="inline-block mt-3 text-sm text-blue-600 hover:underline">
          {actionLabel}
        </a>
      )}
    </div>
  );
}
