import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react'
import { useFormik } from 'formik'
import { useMemo } from 'react'
import { toFormikValidate } from 'zod-formik-adapter'
import { useLocalStorage } from '../hooks/use-localstorage'
import type { Task } from '../validationSchemas/task.schema'
import { taskSchema } from '../validationSchemas/task.schema'
import dayjs from 'dayjs'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  taskId?: string | null
}

export function TaskModal({ isOpen, onClose, taskId }: TaskModalProps) {
  const [tasks, setTasks] = useLocalStorage<Task[]>('todo-tasks', [])
  const existingTask = taskId ? tasks.find((t) => t.id === taskId) : null

  const initialValues = useMemo(() => {
    return {
      id: existingTask?.id || crypto.randomUUID(),
      title: existingTask?.title || '',
      description: existingTask?.description || '',
      deadline: existingTask?.deadline || dayjs().format('YYYY-MM-DDTHH:mm'),
      status: existingTask?.status || 'To Do',
      priority: existingTask?.priority || 'Medium',
      createdAt: existingTask?.createdAt || new Date().toISOString(),
    }
  }, [existingTask, isOpen])

  const formik = useFormik<Task>({
    enableReinitialize: true,
    initialValues: initialValues,
    validate: toFormikValidate(taskSchema),
    onSubmit: (values) => {
      if (existingTask) {
        setTasks(tasks.map((t) => (t.id === values.id ? values : t)))
      } else {
        setTasks([...tasks, values])
      }
      onClose()
      formik.resetForm()
    },
  })

  const handleDelete = () => {
    if (!taskId) return
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      setTasks(tasks.filter((t) => t.id !== taskId))
      onClose()
    }
  }

  const isOverdue =
    existingTask &&
    dayjs(formik.values.deadline).isBefore(dayjs()) &&
    formik.values.status !== 'Done'

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <form onSubmit={formik.handleSubmit}>
          <ModalHeader className="flex flex-col gap-1">
            {isOverdue && (
              <Chip color="danger" variant="solid" className="mb-2">
                Quá hạn!
              </Chip>
            )}
            {taskId ? 'Chi tiết & Chỉnh sửa công việc' : 'Thêm công việc mới'}
          </ModalHeader>

          <ModalBody>
            <Input
              label="Tiêu đề"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              isInvalid={!!(formik.touched.title && formik.errors.title)}
              errorMessage={formik.errors.title}
              isRequired
            />
            <Textarea
              label="Mô tả"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
            <Input
              type="datetime-local"
              label="Deadline"
              name="deadline"
              value={formik.values.deadline}
              onChange={formik.handleChange}
              isInvalid={!!(formik.touched.deadline && formik.errors.deadline)}
              errorMessage={formik.errors.deadline}
              isRequired
            />

            <div className="flex gap-4">
              <Select
                label="Trạng thái"
                selectedKeys={[formik.values.status]}
                onSelectionChange={(keys) =>
                  formik.setFieldValue('status', Array.from(keys)[0])
                }
                disallowEmptySelection
              >
                <SelectItem key="To Do">To Do</SelectItem>
                <SelectItem key="In Progress">In Progress</SelectItem>
                <SelectItem key="Done">Done</SelectItem>
              </Select>

              <Select
                label="Độ ưu tiên"
                selectedKeys={[formik.values.priority]}
                onSelectionChange={(keys) =>
                  formik.setFieldValue('priority', Array.from(keys)[0])
                }
                disallowEmptySelection
              >
                <SelectItem key="Low">Low</SelectItem>
                <SelectItem key="Medium">Medium</SelectItem>
                <SelectItem key="High">High</SelectItem>
                <SelectItem key="Urgent">Urgent</SelectItem>
              </Select>
            </div>

            {taskId && (
              <p className="text-xs text-gray-400 mt-4">
                Ngày tạo: {new Date(formik.values.createdAt).toLocaleString()}
              </p>
            )}
          </ModalBody>

          <ModalFooter>
            {taskId && (
              <Button color="danger" variant="light" onPress={handleDelete}>
                Xóa công việc
              </Button>
            )}
            <Button color="default" variant="light" onPress={onClose}>
              Hủy
            </Button>
            <Button color="primary" type="submit" isDisabled={!formik.dirty}>
              {taskId ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
