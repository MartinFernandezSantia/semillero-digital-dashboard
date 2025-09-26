'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SubmissionStats {
  onTime: number;
  late: number;
  resubmitted: number;
  notSubmitted: number;
  total: number;
}

interface SubmissionDonutChartProps {
  courseName: string;
  stats: SubmissionStats;
}

export function SubmissionDonutChart({ courseName, stats }: SubmissionDonutChartProps) {
  const { onTime, late, resubmitted, notSubmitted, total } = stats;
  
  // Calcular porcentajes
  const onTimePercent = total > 0 ? Math.round((onTime / total) * 100) : 0;
  const latePercent = total > 0 ? Math.round((late / total) * 100) : 0;
  const resubmittedPercent = total > 0 ? Math.round((resubmitted / total) * 100) : 0;
  const notSubmittedPercent = total > 0 ? Math.round((notSubmitted / total) * 100) : 0;

  // Crear segmentos para el donut (usando CSS conic-gradient)
  const createDonutGradient = () => {
    if (total === 0) return 'conic-gradient(#e5e7eb 0deg 360deg)';
    
    let currentDegree = 0;
    const segments = [];
    
    if (onTime > 0) {
      const degrees = (onTime / total) * 360;
      segments.push(`#22c55e ${currentDegree}deg ${currentDegree + degrees}deg`);
      currentDegree += degrees;
    }
    
    if (late > 0) {
      const degrees = (late / total) * 360;
      segments.push(`#eab308 ${currentDegree}deg ${currentDegree + degrees}deg`);
      currentDegree += degrees;
    }
    
    if (resubmitted > 0) {
      const degrees = (resubmitted / total) * 360;
      segments.push(`#3b82f6 ${currentDegree}deg ${currentDegree + degrees}deg`);
      currentDegree += degrees;
    }
    
    if (notSubmitted > 0) {
      const degrees = (notSubmitted / total) * 360;
      segments.push(`#ef4444 ${currentDegree}deg ${currentDegree + degrees}deg`);
    }
    
    return `conic-gradient(${segments.join(', ')})`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{courseName}</CardTitle>
        <CardDescription>Estadísticas de entregas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Donut Chart */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <div 
              className="w-32 h-32 rounded-full"
              style={{
                background: createDonutGradient(),
                mask: 'radial-gradient(circle at center, transparent 40%, black 40%)',
                WebkitMask: 'radial-gradient(circle at center, transparent 40%, black 40%)'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="flex-1">
              <div className="text-sm font-medium">A tiempo</div>
              <div className="text-xs text-gray-500">{onTime} ({onTimePercent}%)</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="flex-1">
              <div className="text-sm font-medium">Con retraso</div>
              <div className="text-xs text-gray-500">{late} ({latePercent}%)</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div className="flex-1">
              <div className="text-sm font-medium">Reentrega</div>
              <div className="text-xs text-gray-500">{resubmitted} ({resubmittedPercent}%)</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="flex-1">
              <div className="text-sm font-medium">No entregado</div>
              <div className="text-xs text-gray-500">{notSubmitted} ({notSubmittedPercent}%)</div>
            </div>
          </div>
        </div>

        {/* Métricas adicionales */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tasa de entrega</span>
            <Badge variant={onTimePercent + latePercent + resubmittedPercent >= 80 ? "default" : "destructive"}>
              {onTimePercent + latePercent + resubmittedPercent}%
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Entregas puntuales</span>
            <Badge variant={onTimePercent >= 70 ? "default" : onTimePercent >= 50 ? "secondary" : "destructive"}>
              {onTimePercent}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
