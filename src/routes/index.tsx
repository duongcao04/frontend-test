import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
} from '@heroui/react'
import { createFileRoute, useSearch, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useLocalStorage } from '../hooks/use-localstorage'
import { TaskModal } from '../components/TaskModal'
import type { Task } from '../validationSchemas/task.schema'

const DEFAULT_SORT = 'newest'
const dashboardParamsSchema = z.object({
  sort: z.string().optional().catch(DEFAULT_SORT),
  search: z.string().trim().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
})
type TDashboardSearch = z.infer<typeof dashboardParamsSchema>

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'Dashboard' }] }),
  validateSearch: (search) => dashboardParamsSchema.parse(search),
  ssr: false,
  loaderDeps: ({ search }) => ({ search }),
  component: DashboardPage,
})

function DashboardPage() {
  const searchParams = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })

  const [tasks] = useLocalStorage<Task[]>('todo-tasks', [])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const openNewTaskModal = () => {
    setSelectedTaskId(null)
    setIsModalOpen(true)
  }

  const openEditTaskModal = (taskId: string) => {
    setSelectedTaskId(taskId)
    setIsModalOpen(true)
  }

  const searchQuery = searchParams.search || ''
  const statusFilter = searchParams.status || 'All'
  const priorityFilter = searchParams.priority || 'All'
  const sortBy = searchParams.sort || 'newest'

  const updateSearch = (newParams: Partial<TDashboardSearch>) => {
    navigate({
      search: (prev) => ({ ...prev, ...newParams }),
      replace: true,
    })
  }

  // Filter and Sort Logic
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks]

    if (searchQuery) {
      result = result.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    if (statusFilter !== 'All') {
      result = result.filter((t) => t.status === statusFilter)
    }
    if (priorityFilter !== 'All') {
      result = result.filter((t) => t.priority === priorityFilter)
    }

    result.sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return result
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy])

  const priorityColors: Record<string, string> = {
    Low: 'success',
    Medium: 'warning',
    High: 'danger',
    Urgent: 'secondary',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskId={selectedTaskId}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Todo Dashboard</h1>
        <Button color="primary" onPress={openNewTaskModal}>
          Thêm công việc
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Tìm kiếm theo Tiêu đề..."
          value={searchQuery}
          onValueChange={(val) => updateSearch({ search: val || undefined })}
        />
        <Select
          label="Trạng thái"
          selectedKeys={[statusFilter]}
          onSelectionChange={(keys) =>
            updateSearch({ status: Array.from(keys)[0] as string })
          }
        >
          <SelectItem key="All">Tất cả</SelectItem>
          <SelectItem key="To Do">To Do</SelectItem>
          <SelectItem key="In Progress">In Progress</SelectItem>
          <SelectItem key="Done">Done</SelectItem>
        </Select>
        <Select
          label="Độ ưu tiên"
          selectedKeys={[priorityFilter]}
          onSelectionChange={(keys) =>
            updateSearch({ priority: Array.from(keys)[0] as string })
          }
        >
          <SelectItem key="All">Tất cả</SelectItem>
          <SelectItem key="Low">Low</SelectItem>
          <SelectItem key="Medium">Medium</SelectItem>
          <SelectItem key="High">High</SelectItem>
          <SelectItem key="Urgent">Urgent</SelectItem>
        </Select>
        <Select
          label="Sắp xếp"
          selectedKeys={[sortBy]}
          onSelectionChange={(keys) =>
            updateSearch({ sort: Array.from(keys)[0] as string })
          }
        >
          <SelectItem key="newest">Mới tạo nhất</SelectItem>
          <SelectItem key="deadline">Deadline gần nhất</SelectItem>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredAndSortedTasks.map((task) => (
          <Card
            key={task.id}
            isPressable
            onPress={() => openEditTaskModal(task.id)}
          >
            <CardHeader className="flex justify-between">
              <h3 className="font-bold truncate">{task.title}</h3>
              <Chip color={priorityColors[task.priority] as any}>
                {task.priority}
              </Chip>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-500">
                Deadline: {new Date(task.deadline).toLocaleString()}
              </p>
            </CardBody>
          </Card>
        ))}
        {filteredAndSortedTasks.length === 0 && (
          <p className="text-gray-500 col-span-3 text-center py-8">
            Không có công việc nào.
          </p>
        )}
      </div>
    </div>
  )
}
