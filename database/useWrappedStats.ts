import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";

import { CourseStatus } from "@/services/shared/timetable";

import { getDatabaseInstance } from "./DatabaseProvider";
import Course from "./models/Timetable";


export function useWrappedStats() {
  const [stats, setStats] = useState({
    topSubject: null as string | null,
    topSubjectCount: 0,
    topTeacher: null as string | null,
    topTeacherCount: 0,
    topRoom: null as string | null,
    topRoomCount: 0,
    totalHours: 0,
  });

  useEffect(() => {
    const calculateStats = async () => {
      const db = getDatabaseInstance();
      const now = new Date();
      
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); 
      let startYear = currentYear;
      if (currentMonth < 8) { 
        startYear = currentYear - 1;
      }
      const startDate = new Date(startYear, 8, 1);

      // STATS DEES COURS
      const courses = await db.get<Course>('courses')
        .query(
          Q.where('from', Q.between(startDate.getTime(), now.getTime()))
        )
        .fetch();

      const subjectCounts: Record<string, number> = {};
      const teacherCounts: Record<string, number> = {};
      const roomCounts: Record<string, number> = {};
      let totalDurationMs = 0;

      courses.forEach(course => {
        if (course.status === CourseStatus.CANCELED) {return;}
        
        // Cours le plus eu
        if (course.subject) {
          subjectCounts[course.subject] = (subjectCounts[course.subject] || 0) + 1;
        }

        // Prof le plus vu
        if (course.teacher) {
          teacherCounts[course.teacher] = (teacherCounts[course.teacher] || 0) + 1;
        }

        // Salle la plus eue
        if (course.room) {
          roomCounts[course.room] = (roomCounts[course.room] || 0) + 1;
        }

        // Temps total en cours 
        if (course.from && course.to) {
          totalDurationMs += (course.to - course.from);
        }
      });

      const getTopKey = (counts: Record<string, number>) => {
        let max = 0;
        let best = null;
        for (const [key, count] of Object.entries(counts)) {
          if (count > max) {
            max = count;
            best = key;
          }
        }
        return best;
      };

      const topSubject = getTopKey(subjectCounts);
      const topSubjectCount = subjectCounts[topSubject] || 0;
      const topTeacher = getTopKey(teacherCounts);
      const topTeacherCount = teacherCounts[topTeacher] || 0;
      const topRoom = getTopKey(roomCounts);
      const topRoomCount = roomCounts[topRoom] || 0;
      const totalHours = Math.round(totalDurationMs / (1000 * 60 * 60));

      setStats({
        topSubject,
        topSubjectCount,
        topTeacher,
        topTeacherCount,
        topRoom,
        topRoomCount,
        totalHours,
      });
    };

    calculateStats();
  }, []);

  return stats;
}
