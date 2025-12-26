import { useState, useMemo, useCallback } from 'react';
import { t } from 'i18next';
import { Homework } from "@/services/shared/homework";
import { getSubjectName } from "@/utils/subjects/name";

export type SortMethod = 'date' | 'subject' | 'done';

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const formatDateHeader = (date: Date): string => {
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
};

export interface HomeworkSection {
  id: string;
  title: string;
  date?: Date;
  data: Homework[];
}

export const useTaskFilters = (
  homeworksFromCache: Homework[],
  homework: Record<string, Homework>
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUndoneOnly, setShowUndoneOnly] = useState(false);
  const [sortMethod, setSortMethod] = useState<SortMethod>("date");
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);

  const toggleGroup = useCallback((headerId: string) => {
    setCollapsedGroups(prev => {
      if (prev.includes(headerId)) {
        return prev.filter(id => id !== headerId);
      }
      return [...prev, headerId];
    });
  }, []);

  const sections = useMemo<HomeworkSection[]>(() => {
    const mergedData = homeworksFromCache.map(cached => {
      const fresh = cached.id && homework[cached.id];
      return fresh || cached;
    });

    const uniqueIds = new Set<string>();
    let data = mergedData.filter(hw => {
      if (hw.id) {
        if (!uniqueIds.has(hw.id)) {
          uniqueIds.add(hw.id);
          return true;
        }
        return false;
      }
      return true;
    });

    if (showUndoneOnly) {
      data = data.filter(h => !h.isDone);
    }

    if (searchTerm.trim().length > 0) {
      const term = normalize(searchTerm);
      data = data.filter(h => {
        const cleanContent = h.content.replace(/<[^>]*>/g, "");
        const normalizedContent = normalize(cleanContent);
        const normalizedSubject = normalize(h.subject);
        const normalizedSubjectName = normalize(getSubjectName(h.subject));
        return (
          normalizedContent.includes(term) ||
          normalizedSubject.includes(term) ||
          normalizedSubjectName.includes(term)
        );
      });
    }

    if (sortMethod === 'date') {
      data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    } else if (sortMethod === 'subject') {
      data.sort((a, b) => a.subject.localeCompare(b.subject));
    } else if (sortMethod === 'done') {
      data.sort((a, b) => Number(a.isDone) - Number(b.isDone));
    }

    const isSearching = searchTerm.trim().length > 0;

    if (sortMethod === 'date' && !isSearching) {
      const sectionMap = new Map<string, HomeworkSection>();

      data.forEach((hw) => {
        const hwDate = new Date(hw.dueDate);
        const dateKey = hwDate.toDateString();
        const headerId = `header-${dateKey}`;

        if (!sectionMap.has(dateKey)) {
          sectionMap.set(dateKey, {
            id: headerId,
            title: formatDateHeader(hwDate),
            date: hwDate,
            data: []
          });
        }

        sectionMap.get(dateKey)!.data.push(hw);
      });

      return Array.from(sectionMap.values());
    }

    return [
      {
        id: 'all',
        title: '',
        data
      }
    ];
  }, [homeworksFromCache, homework, showUndoneOnly, searchTerm, sortMethod]);

  return {
    searchTerm,
    setSearchTerm,
    showUndoneOnly,
    setShowUndoneOnly,
    sortMethod,
    setSortMethod,
    collapsedGroups,
    toggleGroup,
    sections,
  };
};