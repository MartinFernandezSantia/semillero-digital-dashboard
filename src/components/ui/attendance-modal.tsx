'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Calendar, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { prepareAttendanceData, submitAttendance } from '@/app/actions/attendance';

interface Student {
  id: string;
  googleId: string;
  name: string;
  email: string;
  photoUrl?: string;
  present: boolean;
}

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
}

export function AttendanceModal({ isOpen, onClose, courseId, courseName }: AttendanceModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>('');
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && courseId) {
      loadAttendanceData();
    }
  }, [isOpen, courseId]);

  const loadAttendanceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await prepareAttendanceData(courseId);
      
      if (result.success && result.data) {
        console.log('📊 Attendance data received:', result.data);
        console.log('👥 Students data:', result.data.students);
        setStudents(result.data.students);
        setDate(result.data.date);
        setHasExistingAttendance(result.data.hasExistingAttendance);
      } else {
        console.error('❌ Error loading attendance data:', result.error);
        setError(result.error || 'Error al cargar estudiantes');
      }
    } catch (err) {
      console.error('Error loading attendance data:', err);
      setError('Error al cargar los datos de asistencia');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, present: !student.present }
          : student
      )
    );
  };

  const toggleAll = () => {
    const allPresent = students.every(s => s.present);
    setStudents(prev => 
      prev.map(student => ({ ...student, present: !allPresent }))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const attendanceData = students.map(student => ({
        userId: student.id,
        present: student.present
      }));
      
      const result = await submitAttendance(courseId, date, attendanceData);
      
      if (result.success) {
        onClose();
        // Podrías agregar una notificación de éxito aquí
      } else {
        setError(result.error || 'Error al guardar asistencias');
      }
    } catch (err) {
      console.error('Error saving attendance:', err);
      setError('Error al guardar las asistencias');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(s => s.present).length;
  const absentCount = students.length - presentCount;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span>Tomar Asistencia</span>
          </DialogTitle>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{courseName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            {hasExistingAttendance && (
              <Badge variant="secondary" className="text-xs">
                Ya existe asistencia para hoy - se actualizará
              </Badge>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-gray-600">Cargando estudiantes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <XCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-red-600">{error}</p>
              <Button variant="outline" onClick={loadAttendanceData}>
                Reintentar
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                <div className="text-xs text-gray-500">Presentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                <div className="text-xs text-gray-500">Ausentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{attendanceRate}%</div>
                <div className="text-xs text-gray-500">Asistencia</div>
              </div>
            </div>

            {/* Control para marcar/desmarcar todos */}
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Checkbox
                id="toggle-all"
                checked={students.length > 0 && students.every(s => s.present)}
                onCheckedChange={toggleAll}
              />
              <label htmlFor="toggle-all" className="text-sm font-medium cursor-pointer">
                Marcar todos como presentes
              </label>
            </div>

            {/* Lista de estudiantes */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    student.present 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Checkbox
                    id={`student-${student.id}`}
                    checked={student.present}
                    onCheckedChange={() => toggleStudent(student.id)}
                  />
                  
                  <div className="flex items-center space-x-3 flex-1">
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="font-medium text-sm">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {student.present ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || saving || students.length === 0}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Guardar Asistencia
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
