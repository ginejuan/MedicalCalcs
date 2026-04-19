import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useLanguage } from '../../contexts/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const whiteBackgroundPlugin = {
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart: any, _args: any, options: any) => {
    const {ctx} = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = options.color || '#white';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};

interface PercentileChartProps {
  gaValues: number[];
  p3: number[];
  p10: number[];
  p50: number[];
  p90: number[];
  p97: number[];
  caseData: (number | null)[];
  yAxisLabel: string;
}

export const PercentileChart: React.FC<PercentileChartProps> = ({
  gaValues,
  p3,
  p10,
  p50,
  p90,
  p97,
  caseData,
  yAxisLabel
}) => {
  const { t } = useLanguage();
  const chartRef = useRef<any>(null);

  const data = {
    labels: gaValues,
    datasets: [
      {
        label: 'p3',
        data: p3,
        borderColor: 'rgba(198,40,40,0.3)',
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'p10',
        data: p10,
        borderColor: '#E65100',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'p50',
        data: p50,
        borderColor: '#2E7D32',
        borderWidth: 2.5,
        pointRadius: 0,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'p90',
        data: p90,
        borderColor: '#1565C0',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'p97',
        data: p97,
        borderColor: 'rgba(21,101,192,0.3)',
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
        tension: 0.4,
      },
      {
        label: t('caseLabel'),
        data: caseData,
        borderColor: '#C62828',
        backgroundColor: '#C62828',
        pointRadius: 6,
        pointHoverRadius: 8,
        pointStyle: 'circle',
        pointBorderWidth: 0,
        showLine: false,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 14,
          font: { size: 11 },
          filter: (item: any) => item.text !== 'p3' && item.text !== 'p97',
        },
      },
      tooltip: {
        callbacks: {
          title: (items: any) => t('tooltipWeek') + ' ' + items[0].label,
          label: (ctx: any) => (ctx.raw === null ? undefined : `${ctx.dataset.label}: ${ctx.raw}`),
        },
      },
      customCanvasBackgroundColor: {
        color: 'white',
      }
    },
    scales: {
      x: {
        title: { display: true, text: t('xAxis'), color: '#666', font: { size: 11 } },
        grid: { color: '#f0f0f0' },
        ticks: { color: '#888', maxTicksLimit: 15 },
      },
      y: {
        title: { display: true, text: yAxisLabel, color: '#666', font: { size: 11 } },
        grid: { color: '#f0f0f0' },
        ticks: { color: '#888' },
      },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '350px' }}>
      <Line ref={chartRef} id="percentile-chart-canvas" data={data} options={options} plugins={[whiteBackgroundPlugin]} />
    </div>
  );
};
