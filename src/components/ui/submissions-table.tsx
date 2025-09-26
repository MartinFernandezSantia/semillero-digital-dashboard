'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { formatDate } from "@/lib/submission-utils";

export type SubmissionStatus = 'ON_TIME' | 'LATE' | 'RESUBMITTED' | 'NOT_SUBMITTED' | 'PENDING';

export interface StudentSubmissionData {
  studentId: string;
  studentName: string;
  studentEmail: string;
  submissions: {
    [assignmentId: string]: {
      status: SubmissionStatus;
      submittedAt?: string;
      dueDate?: string;
      grade?: number;
      maxPoints?: number;
    };
  };
}

export interface AssignmentData {
  id: string;
  title: string;
  dueDate?: string;
  maxPoints?: number;
}

interface SubmissionsTableProps {
  courseName: string;
  students: StudentSubmissionData[];
  assignments: AssignmentData[];
}

const statusConfig = {
  ON_TIME: { 
    label: 'A tiempo', 
    color: 'bg-green-500', 
    textColor: 'text-green-700', 
    bgColor: 'bg-green-50'
  },
  LATE: { 
    label: 'Con retraso', 
    color: 'bg-yellow-500', 
    textColor: 'text-yellow-700', 
    bgColor: 'bg-yellow-50'
  },
  RESUBMITTED: { 
    label: 'Reentrega', 
    color: 'bg-blue-500', 
    textColor: 'text-blue-700', 
    bgColor: 'bg-blue-50'
  },
  NOT_SUBMITTED: { 
    label: 'No entregado', 
    color: 'bg-red-500', 
    textColor: 'text-red-700', 
    bgColor: 'bg-red-50'
  },
  PENDING: { 
    label: 'Pendiente', 
    color: 'bg-gray-500', 
    textColor: 'text-gray-700', 
    bgColor: 'bg-gray-50'
  }
};

export function SubmissionsTable({ courseName, students, assignments }: SubmissionsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');

  // Filtrar datos
  const filteredData = useMemo(() => {
    return students.filter(student => {
      // Filtro por nombre de estudiante
      const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por estudiante específico
      const matchesStudent = selectedStudent === 'all' || student.studentId === selectedStudent;
      
      // Filtro por estado (verificar si el estudiante tiene al menos una entrega con el estado seleccionado)
      let matchesStatus = selectedStatus === 'all';
      if (!matchesStatus && selectedStatus !== 'all') {
        matchesStatus = Object.values(student.submissions).some(
          submission => submission.status === selectedStatus
        );
      }
      
      return matchesSearch && matchesStudent && matchesStatus;
    });
  }, [students, searchTerm, selectedStudent, selectedStatus]);

  // Filtrar asignaciones
  const filteredAssignments = useMemo(() => {
    if (selectedAssignment === 'all') return assignments;
    return assignments.filter(assignment => assignment.id === selectedAssignment);
  }, [assignments, selectedAssignment]);


  const getSubmissionCell = (student: StudentSubmissionData, assignment: AssignmentData) => {
    const submission = student.submissions[assignment.id];
    const status = submission?.status || 'NOT_SUBMITTED';
    const config = statusConfig[status];
    
    return (
      <TableCell key={`${student.studentId}-${assignment.id}`} className="p-2 text-center">
        <div className={`w-4 h-4 rounded-full ${config.color} mx-auto cursor-pointer hover:scale-125 transition-transform`}
             title={`${config.label}${submission?.grade !== undefined ? ` - ${submission.grade}/${submission.maxPoints || assignment.maxPoints || 100}` : ''}`}>
        </div>
      </TableCell>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{courseName}</CardTitle>
        <CardDescription>Tabla de entregas por estudiante</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estudiante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {students.map(student => (
                  <SelectItem key={student.studentId} value={student.studentId}>
                    {student.studentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Actividad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {assignments.map(assignment => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>


        {/* Tabla */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-auto" style={{ maxHeight: '320px' }}>
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="w-48 font-semibold text-center">Estudiante</TableHead>
                  {filteredAssignments.map(assignment => (
                    <TableHead key={assignment.id} className="text-center min-w-20">
                      <div className="space-y-1">
                        <div className="font-medium text-xs">{assignment.title}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(assignment.dueDate)}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map(student => (
                  <TableRow key={student.studentId} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-center">
                      <div>
                        <div className="font-semibold text-sm">{student.studentName}</div>
                        <div className="text-xs text-gray-500">{student.studentEmail}</div>
                      </div>
                    </TableCell>
                    {filteredAssignments.map(assignment => 
                      getSubmissionCell(student, assignment)
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron estudiantes con los filtros aplicados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
