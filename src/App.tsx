import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface Publication {
  link: string;
  quality: string;
}

function App() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    fetch('/src/assets/Deysa.csv')
      .then(response => response.text())
      .then(data => {
        const rows = data.split('\n').slice(1); // Skip header
        const parsed = rows.map(row => {
          const [link, quality] = row.split(',');
          return { link, quality: quality?.trim() };
        }).filter(pub => pub.quality); // Filter out empty qualities
        setPublications(parsed);
      });
  }, []);

  const qualityCounts = publications.reduce((acc, pub) => {
    acc[pub.quality] = (acc[pub.quality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: Object.keys(qualityCounts),
    datasets: [
      {
        data: Object.values(qualityCounts),
        backgroundColor: [
          '#1b5e20', // MUY BIEN - Dark green
          '#4caf50', // BIEN - Light green
          '#ffc107', // REGULAR - Yellow
          '#ef5350', // MALA - Light red
          '#d32f2f', // MUY MALA - Strong red
        ],
      },
    ],
  };

  const averageQuality = publications.length > 0
    ? (
      Object.entries(qualityCounts).reduce((acc, [quality, count]) => {
        const score = quality === 'MUY BIEN' ? 5 
          : quality === 'BIEN' ? 4 
          : quality === 'REGULAR' ? 3 
          : quality === 'MALA' ? 2 
          : 1;
        return acc + (score * count);
      }, 0) / publications.length
    ).toFixed(2)
    : '0';

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'MUY BIEN': return 'bg-[#1b5e20]';
      case 'BIEN': return 'bg-[#4caf50]';
      case 'REGULAR': return 'bg-[#ffc107]';
      case 'MALA': return 'bg-[#ef5350]';
      case 'MUY MALA': return 'bg-[#d32f2f]';
      default: return 'bg-gray-200';
    }
  };

  const getQualityTextColor = (quality: string) => {
    switch (quality) {
      case 'MUY BIEN':
      case 'BIEN':
      case 'MUY MALA':
        return 'text-white';
      default:
        return 'text-gray-900';
    }
  };

  const qualityGroups = {
    'MUY BIEN': publications.filter(p => p.quality === 'MUY BIEN'),
    'BIEN': publications.filter(p => p.quality === 'BIEN'),
    'REGULAR': publications.filter(p => p.quality === 'REGULAR'),
    'MALA': publications.filter(p => p.quality === 'MALA'),
    'MUY MALA': publications.filter(p => p.quality === 'MUY MALA'),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Análisis de Calidad de Publicaciones</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Distribución de Calidades</h2>
            <div className="w-full h-[400px] flex items-center justify-center">
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Puntuación Promedio</h2>
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600">{averageQuality}</div>
                <div className="text-gray-500 mt-4">de 5 puntos</div>
                <div className="text-sm text-gray-400 mt-2">
                  Basado en {publications.length} publicaciones
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Detalle de Publicaciones</h2>
            
            {Object.entries(qualityGroups).map(([quality, pubs]) => (
              <div key={quality} className="mb-4">
                <button
                  className={`w-full flex items-center justify-between p-4 rounded-lg hover:opacity-90 transition-colors ${getQualityColor(quality)} ${getQualityTextColor(quality)}`}
                  onClick={() => setExpandedSection(expandedSection === quality ? null : quality)}
                >
                  <div className="flex items-center">
                    <span className="font-medium">{quality}</span>
                    <span className={`ml-2 ${getQualityTextColor(quality)} opacity-80`}>({pubs.length} publicaciones)</span>
                  </div>
                  {expandedSection === quality ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedSection === quality && (
                  <div className="mt-2 pl-4">
                    {pubs.map((pub, index) => (
                      <div key={index} className="py-2 flex items-center">
                        <ExternalLink size={16} className="mr-2 text-gray-400" />
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all"
                        >
                          {pub.link}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;