import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import html2canvas from 'html2canvas';
import { TOUHOU_DATA, type TouhouCharacter } from './data';

declare global {
  interface Window {
    Plotly: {
      react: (el: HTMLElement, traces: unknown[], layout: unknown, config?: unknown) => void;
    };
  }
}

export default function TouhouVoteChart(): React.JSX.Element {
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(
    new Set()
  );
  const [filteredCharacters, setFilteredCharacters] =
    useState<TouhouCharacter[]>(TOUHOU_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const chartRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // 문자열 정규화 함수
  const normalizeString = (str: string): string => {
    if (!str) return '';
    return str.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
  };

  // 사용 가능한 필드 확인
  const hasPrev2 = TOUHOU_DATA.some((r) => r.rank_prev2 != null);
  const hasPrev = TOUHOU_DATA.some((r) => r.rank_prev != null);
  const hasNow = TOUHOU_DATA.some((r) => r.rank_now != null);

  // 검색 필터링
  useEffect(() => {
    const filtered = TOUHOU_DATA.filter((character) => {
      const ja = normalizeString(character.name_ja);
      const en = normalizeString(character.name_en || '');
      const query = normalizeString(searchQuery);
      return !query || ja.includes(query) || en.includes(query);
    }).sort((a, b) => (a.rank_now ?? 1e9) - (b.rank_now ?? 1e9));

    setFilteredCharacters(filtered);
  }, [searchQuery]);

  // 전체 선택/해제
  const handleSelectAll = () => {
    const newSelected = new Set(filteredCharacters.map((c) => c.name_ja));
    setSelectedCharacters(newSelected);
  };

  const handleClearAll = () => {
    setSelectedCharacters(new Set());
  };

  // 캐릭터 선택/해제
  const handleCharacterToggle = (characterName: string, checked: boolean) => {
    const newSelected = new Set(selectedCharacters);
    if (checked) {
      newSelected.add(characterName);
    } else {
      newSelected.delete(characterName);
    }
    setSelectedCharacters(newSelected);
  };

  // 요약 테이블 스크린샷 저장
  const handleScreenshot = async () => {
    if (!summaryRef.current || selectedCharacters.size === 0) {
      alert('먼저 캐릭터를 선택해주세요.');
      return;
    }

    try {
      const tableElement = summaryRef.current.querySelector('table');
      if (!tableElement) {
        alert('테이블을 찾을 수 없습니다.');
        return;
      }

      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        padding: 50px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: visible;
      `;

      const clonedTable = tableElement.cloneNode(true) as HTMLElement;
      clonedTable.style.cssText = `
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        margin: 0;
        background: white;
        border-radius: 8px;
        overflow: visible;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      `;

      tempContainer.appendChild(clonedTable);
      document.body.appendChild(tempContainer);

      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight,
        foreignObjectRendering: false,
      });

      document.body.removeChild(tempContainer);

      const link = document.createElement('a');
      link.download = `동방투표결과_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('스크린샷 생성 실패:', error);
      alert('스크린샷 생성에 실패했습니다.');
    }
  };

  // 차트 렌더링
  useEffect(() => {
    if (!chartRef.current || selectedCharacters.size === 0) return;

    if (typeof window !== 'undefined' && window.Plotly) {
      renderChart();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-2.35.2.min.js';
      script.onload = renderChart;
      document.head.appendChild(script);
    }
  }, [selectedCharacters]);

  const renderChart = () => {
    if (!chartRef.current || !window.Plotly) return;

    const selectedChars = TOUHOU_DATA.filter((r) =>
      selectedCharacters.has(r.name_ja)
    );
    const traces: unknown[] = [];

    selectedChars.forEach((character) => {
      const xValues: string[] = [];
      const yValues: number[] = [];

      if (hasPrev2 && character.rank_prev2 != null) {
        xValues.push('23년도');
        yValues.push(character.rank_prev2);
      }
      if (hasPrev && character.rank_prev != null) {
        xValues.push('24년도');
        yValues.push(character.rank_prev);
      }
      if (hasNow && character.rank_now != null) {
        xValues.push('현재');
        yValues.push(character.rank_now);
      }

      if (yValues.length > 0) {
        traces.push({
          x: xValues,
          y: yValues,
          mode: 'lines+markers',
          type: 'scatter',
          name: character.name_ja,
          hovertemplate: '순위=%{y}<extra></extra>',
        });
      }
    });

    const layout = {
      yaxis: {
        autorange: 'reversed',
        title: '순위 (작을수록 상위)',
        gridcolor: '#f0f0f0',
      },
      xaxis: {
        title: '투표 시점',
        gridcolor: '#f0f0f0',
      },
      height: 540,
      margin: { l: 60, r: 30, t: 40, b: 60 },
      legend: {
        title: { text: '캐릭터' },
        bgcolor: 'rgba(255,255,255,0.9)',
      },
      plot_bgcolor: '#ffffff',
      paper_bgcolor: '#ffffff',
      font: { size: 12 },
    };

    window.Plotly.react(chartRef.current, traces, layout, {
      displayModeBar: true,
      responsive: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    });
  };

  // 요약 테이블 렌더링
  const renderSummaryTable = () => {
    const columns = ['name_ja'];
    if (hasPrev2) columns.push('rank_prev2');
    if (hasPrev) columns.push('rank_prev');
    if (hasNow) columns.push('rank_now');
    if (TOUHOU_DATA.some((r) => r.points != null)) columns.push('points');

    const showDelta = hasPrev && hasNow;
    const selectedChars = TOUHOU_DATA.filter((r) =>
      selectedCharacters.has(r.name_ja)
    );

    return (
      <table className={styles.summaryTable}>
        <thead>
          <tr>
            {columns.map((col) => {
              let colName = '';
              switch (col) {
                case 'name_ja':
                  colName = '캐릭터명';
                  break;
                case 'rank_prev2':
                  colName = '23년도';
                  break;
                case 'rank_prev':
                  colName = '24년도';
                  break;
                case 'rank_now':
                  colName = '현재';
                  break;
                case 'points':
                  colName = '포인트';
                  break;
                default:
                  colName = col;
              }
              return <th key={col}>{colName}</th>;
            })}
            {showDelta && <th>변화</th>}
          </tr>
        </thead>
        <tbody>
          {selectedChars
            .sort((a, b) => (a.rank_now ?? 1e9) - (b.rank_now ?? 1e9))
            .map((character) => (
              <tr key={character.name_ja}>
                {columns.map((col) => (
                  <td key={col}>
                    {character[col as keyof TouhouCharacter] ?? '-'}
                  </td>
                ))}
                {showDelta && (
                  <td className={styles.deltaCell}>
                    {(() => {
                      const delta =
                        character.rank_prev != null &&
                        character.rank_now != null
                          ? +character.rank_prev - +character.rank_now
                          : null;
                      if (delta === null) return '-';
                      const deltaText =
                        delta > 0 ? `+${delta}` : delta.toString();
                      const deltaClass =
                        delta > 0
                          ? styles.positive
                          : delta < 0
                          ? styles.negative
                          : '';
                      return <span className={deltaClass}>{deltaText}</span>;
                    })()}
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.chartLayout}>
        <div className={styles.controlPanel}>
          <div className={styles.controls}>
            <input
              type="text"
              placeholder="일본어/영어로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button onClick={handleSelectAll} className={styles.button}>
              전체 선택
            </button>
            <button onClick={handleClearAll} className={styles.button}>
              전체 해제
            </button>
          </div>

          <div className={styles.countLabel}>
            {selectedCharacters.size} 선택됨
          </div>

          <div className={styles.characterList}>
            {filteredCharacters.map((character) => (
              <div key={character.name_ja} className={styles.characterItem}>
                <input
                  type="checkbox"
                  checked={selectedCharacters.has(character.name_ja)}
                  onChange={(e) =>
                    handleCharacterToggle(character.name_ja, e.target.checked)
                  }
                  id={`char-${character.name_ja}`}
                  className={styles.checkbox}
                />
                <label
                  htmlFor={`char-${character.name_ja}`}
                  className={styles.characterLabel}
                >
                  {character.name_ja}{' '}
                  {character.rank_now ? `(현재 ${character.rank_now}위)` : ''}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.chartPanel}>
        <div ref={chartRef} className={styles.chartArea} />
        <div className={styles.chartNote}>순위는 작을수록 상위</div>
      </div>

      <div className={styles.summaryPanel}>
        <div className={styles.summaryHeader}>
          <h3>요약</h3>
          {selectedCharacters.size > 0 && (
            <button
              onClick={handleScreenshot}
              className={styles.screenshotButton}
              title="요약 테이블을 이미지로 저장"
            >
              📸 스크린샷 저장
            </button>
          )}
        </div>
        <div ref={summaryRef}>
          {selectedCharacters.size > 0 ? (
            <div className={styles.summaryTableContainer}>
              {renderSummaryTable()}
            </div>
          ) : (
            <p className={styles.noSelection}>
              차트에서 캐릭터를 선택해주세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
