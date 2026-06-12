import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Play, BookOpen, Clock, Award, ChevronRight, Search, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { coursesApi } from '@/services/api'
import { PageSpinner } from '@/components/common/Spinner'
import Modal from '@/components/common/Modal'

const CATEGORIES = ['All', 'Data Science', 'Frontend Development', 'AI & ML', 'Cloud Computing', 'Software Engineering', 'Design', 'Data Analytics', 'DevOps', 'Product', 'Leadership']

export default function LearningPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<Record<string, unknown> | null>(null)
  const [activeTab, setActiveTab] = useState<'browse' | 'enrolled'>('browse')

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', search, category],
    queryFn: () => coursesApi.list({ q: search || undefined, category: category || undefined }).then(r => r.data),
    enabled: activeTab === 'browse',
  })

  const { data: enrolled = [] } = useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: () => coursesApi.getEnrolled().then(r => r.data),
    enabled: activeTab === 'enrolled',
  })

  const { data: courseDetail } = useQuery({
    queryKey: ['course', selectedCourse?.id],
    queryFn: () => coursesApi.get(selectedCourse!.id as number).then(r => r.data),
    enabled: !!selectedCourse,
  })

  const startMut = useMutation({
    mutationFn: (id: number) => coursesApi.start(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['enrolled-courses'] }); toast.success('Course started!') },
  })

  const completeLessonMut = useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: number; lessonId: number }) => coursesApi.completeLesson(courseId, lessonId),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['course', selectedCourse?.id] })
      qc.invalidateQueries({ queryKey: ['enrolled-courses'] })
      if (res.data.completed) toast.success('🎉 Course completed! Certificate earned.')
      else toast.success('Lesson completed!')
    },
  })

  const levelColors: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700',
  }

  const progress = courseDetail?.progress

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Learning</h1>
        <div className="flex gap-2">
          {(['browse', 'enrolled'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                activeTab === t ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {t === 'browse' ? 'Browse Courses' : 'My Learning'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'browse' && (
        <>
          {/* Search + Category */}
          <div className="flex gap-3 mb-5">
            <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 gap-2 flex-1">
              <Search size={16} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…" className="bg-transparent text-sm w-full outline-none" />
            </div>
          </div>
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  (cat === 'All' ? !category : category === cat) ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? <PageSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(courses as Record<string, unknown>[]).map(course => (
                <motion.div
                  key={course.id as number}
                  whileHover={{ y: -2 }}
                  className="card cursor-pointer overflow-hidden"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="h-32 bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                    <BookOpen size={48} className="text-white opacity-80" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{course.title as string}</h3>
                    <p className="text-xs text-gray-500 mt-1">{course.instructor as string}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {!!course.level && (
                        <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${levelColors[course.level as string] || 'bg-gray-100 text-gray-600'}`}>
                          {course.level as string}
                        </span>
                      )}
                      {course.is_free ? (
                        <span className="text-xs text-green-600 font-medium">Free</span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-xs text-yellow-500"><Star size={10} /> Premium</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                      <Clock size={12} /> {course.duration_hours as number}h · {course.lesson_count as number} lessons
                    </div>
                    {(course.progress as number) > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{Math.round(course.progress as number)}% complete</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${course.progress as number}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'enrolled' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(enrolled as Record<string, unknown>[]).length === 0 ? (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
              <p>You haven't started any courses yet</p>
            </div>
          ) : (enrolled as Record<string, unknown>[]).map(pr => (
            <div key={pr.id as number} className="card overflow-hidden cursor-pointer" onClick={() => setSelectedCourse({ id: pr.course_id })}>
              <div className="h-28 bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                {(pr.completed as boolean) ? <Award size={40} className="text-white" /> : <BookOpen size={40} className="text-white opacity-80" />}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm">{pr.title as string}</h3>
                <p className="text-xs text-gray-500">{pr.instructor as string}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{Math.round(pr.progress_percent as number)}% complete</span>
                    {(pr.completed as boolean) && <span className="text-green-600 font-medium">✓ Completed</span>}
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full">
                    <div className={`h-full rounded-full ${pr.completed ? 'bg-green-500' : 'bg-brand-500'}`} style={{ width: `${pr.progress_percent as number}%` }} />
                  </div>
                </div>
                {(pr.certificate_url as string) && (
                  <a href={pr.certificate_url as string} className="text-xs text-brand-500 hover:underline flex items-center gap-1 mt-2">
                    <Award size={12} /> View Certificate
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Detail Modal */}
      <Modal isOpen={!!selectedCourse} onClose={() => setSelectedCourse(null)} title={courseDetail?.title as string} size="xl">
        {courseDetail ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{courseDetail.description as string}</p>
            <div className="flex flex-wrap gap-2">
              {courseDetail.level && <span className={`text-xs rounded-full px-2 py-0.5 ${levelColors[courseDetail.level as string] || 'bg-gray-100'}`}>{courseDetail.level as string}</span>}
              <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">{courseDetail.duration_hours as number}h total</span>
              <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">{(courseDetail.lessons as unknown[]).length} lessons</span>
            </div>

            {/* Progress bar */}
            {progress && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{Math.round(progress.progress_percent as number)}% complete</span>
                  {(progress.completed as boolean) && <span className="text-green-600 font-semibold">✓ Completed!</span>}
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${progress.progress_percent as number}%` }} />
                </div>
              </div>
            )}

            {/* Start button */}
            {!progress && (
              <button onClick={() => startMut.mutate(courseDetail.id as number)} className="btn-primary w-full py-2.5">
                <Play size={16} className="inline mr-2" /> Start Learning
              </button>
            )}

            {/* Lessons list */}
            <div>
              <h3 className="font-semibold mb-3">Lessons</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {((courseDetail.lessons || []) as { id: number; title: string; duration_minutes?: number; order_index: number }[]).map((lesson) => {
                  const completedLessons: number[] = (progress?.completed_lessons as number[]) || []
                  const isCompleted = completedLessons.includes(lesson.id)
                  return (
                    <div key={lesson.id} className={`flex items-center justify-between p-3 rounded-lg ${isCompleted ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                          {isCompleted ? '✓' : lesson.order_index + 1}
                        </span>
                        <span className="text-sm">{lesson.title as string}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.duration_minutes && <span className="text-xs text-gray-400">{lesson.duration_minutes}m</span>}
                        {progress && !isCompleted && (
                          <button
                            onClick={() => completeLessonMut.mutate({ courseId: courseDetail.id as number, lessonId: lesson.id })}
                            className="text-xs btn-primary py-1 px-3"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {progress?.certificate_url && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <Award size={32} className="mx-auto text-yellow-500 mb-2" />
                <p className="font-semibold">Certificate Earned!</p>
                <a href={progress.certificate_url as string} className="text-sm text-brand-500 hover:underline mt-1 block">Download Certificate</a>
              </div>
            )}
          </div>
        ) : <PageSpinner />}
      </Modal>
    </div>
  )
}
