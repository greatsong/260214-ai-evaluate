'use client';
import { PRACTICE_TYPES } from '@/lib/constants';

/**
 * 학생 선택 드롭다운 (접근성 포함)
 * @param {Object[]} students - 학생 목록
 * @param {string} value - 선택된 학생 ID
 * @param {function} onChange - 변경 핸들러 (value를 받음)
 * @param {string} [label] - 라벨 텍스트
 * @param {string} [placeholder] - 미선택 시 텍스트
 * @param {boolean} [showClass] - 반 정보 표시 여부
 * @param {string} [className] - 추가 CSS 클래스
 * @param {string} [size] - 'sm' | 'md' (기본 md)
 */
export function StudentSelector({
  students = [], value = '', onChange,
  label = '학생', placeholder = '선택하세요',
  showClass = true, className = '', size = 'md',
}) {
  const id = `student-select-${label.replace(/\s/g, '-')}`;
  const sizeClass = size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm';

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="text-xs text-slate-500 block mb-1">{label}</label>
      )}
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full border rounded ${sizeClass} bg-white`}
      >
        <option value="">{placeholder}</option>
        {students.map(s => (
          <option key={s.id} value={s.id}>
            {s.name}{showClass && s.class_name ? ` (${s.class_name})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * 실천 유형 선택 드롭다운 (접근성 포함)
 * @param {string} value - 선택된 유형
 * @param {function} onChange - 변경 핸들러 (value를 받음)
 * @param {string} [label] - 라벨 텍스트
 * @param {boolean} [includeAll] - '전체' 옵션 포함 여부
 * @param {string} [className] - 추가 CSS 클래스
 * @param {string} [size] - 'sm' | 'md'
 */
export function PracticeTypeSelector({
  value = '', onChange,
  label = '실천 활동', includeAll = false,
  className = '', size = 'md',
}) {
  const id = `practice-select-${label.replace(/\s/g, '-')}`;
  const sizeClass = size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm';

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="text-xs text-slate-500 block mb-1">{label}</label>
      )}
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full border rounded ${sizeClass} bg-white`}
      >
        {includeAll && <option value="">전체</option>}
        {!includeAll && !value && <option value="">선택하세요</option>}
        {Object.entries(PRACTICE_TYPES).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>
  );
}
