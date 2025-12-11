// frontend/src/components/ExcelValidationFeedback.jsx
// Excel validation feedback component (FR-6.3)

import React, { useState } from 'react';

const ExcelValidationFeedback = ({ validationResult }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  if (!validationResult) return null;

  const { success, summary, errors, errorsByRow, hasMoreErrors } = validationResult;

  const toggleRow = (row) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(row)) {
      newExpanded.delete(row);
    } else {
      newExpanded.add(row);
    }
    setExpandedRows(newExpanded);
  };

  // Success state
  if (success) {
    return (
      <div
        style={{
          padding: '16px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #86efac',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          <span style={{ fontWeight: 'bold', color: '#166534' }}>
            유효성 검증 통과
          </span>
        </div>
        <div style={{ marginTop: '8px', color: '#15803d' }}>
          {summary.totalRows}개 행이 모두 유효합니다.
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fecaca',
      }}
    >
      {/* Summary */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>❌</span>
          <span style={{ fontWeight: 'bold', color: '#dc2626' }}>
            유효성 검증 실패
          </span>
        </div>
        <div
          style={{
            marginTop: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}
        >
          <div
            style={{
              padding: '8px',
              backgroundColor: 'white',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {summary.totalRows}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>전체 행</div>
          </div>
          <div
            style={{
              padding: '8px',
              backgroundColor: 'white',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {summary.validRows}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>유효한 행</div>
          </div>
          <div
            style={{
              padding: '8px',
              backgroundColor: 'white',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
              {summary.invalidRows}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>오류 행</div>
          </div>
        </div>
      </div>

      {/* Error List by Row */}
      <div>
        <div
          style={{
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#374151',
          }}
        >
          오류 상세 ({summary.totalErrors}개)
        </div>

        <div
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
          }}
        >
          {errorsByRow?.map(({ row, errors: rowErrors }) => (
            <div key={row} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <div
                onClick={() => toggleRow(row)}
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: expandedRows.has(row) ? '#f3f4f6' : 'transparent',
                }}
              >
                <span style={{ fontWeight: '500' }}>행 {row}</span>
                <span
                  style={{
                    backgroundColor: '#fecaca',
                    color: '#dc2626',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                >
                  {rowErrors.length}개 오류
                </span>
              </div>

              {expandedRows.has(row) && (
                <div style={{ padding: '8px 12px', backgroundColor: '#fafafa' }}>
                  {rowErrors.map((error, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '4px 0',
                        fontSize: '14px',
                        display: 'flex',
                        gap: '8px',
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: '#fee2e2',
                          padding: '0 4px',
                          borderRadius: '2px',
                          fontSize: '12px',
                          color: '#b91c1c',
                        }}
                      >
                        {error.field}
                      </span>
                      <span style={{ color: '#4b5563' }}>{error.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {hasMoreErrors && (
          <div
            style={{
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#fef9c3',
              borderRadius: '4px',
              fontSize: '14px',
              color: '#a16207',
            }}
          >
            표시된 것 외에 더 많은 오류가 있습니다. Excel 파일을 수정한 후 다시
            업로드해주세요.
          </div>
        )}
      </div>

      {/* Quick Fix Guide */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fff7ed',
          borderRadius: '4px',
          border: '1px solid #fed7aa',
        }}
      >
        <div style={{ fontWeight: 'bold', color: '#c2410c', marginBottom: '4px' }}>
          수정 가이드
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#9a3412' }}>
          <li>authorId, authorName, content 컬럼은 필수입니다</li>
          <li>content는 4000자를 초과할 수 없습니다</li>
          <li>timestamp는 YYYY-MM-DD HH:mm:ss 형식이어야 합니다</li>
          <li>중복 메시지(같은 작성자, 같은 내용)는 허용되지 않습니다</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelValidationFeedback;
