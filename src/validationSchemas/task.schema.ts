import dayjs from 'dayjs'
import { z } from 'zod'

export const taskStatusSchema = z.enum(['To Do', 'In Progress', 'Done'])
export const taskPrioritySchema = z.enum(['Low', 'Medium', 'High', 'Urgent'])

export const taskSchema = z.object({
	// ID: Mã định danh duy nhất (UUID hoặc Timestamp)
	id: z.string("ID là bắt buộc").min(1, 'ID là bắt buộc'),

	// Tiêu đề: Bắt buộc
	title: z.string("Tiêu đề công việc là bắt buộc").min(1, 'Tiêu đề công việc là bắt buộc').max(100, 'Tiêu đề quá dài'),

	// Nội dung: Mô tả chi tiết
	description: z.string().optional().default(''),

	// Deadline: Ngày và giờ hết hạn
	deadline: z
		.string({ message: 'Vui lòng chọn deadline' })
		.min(1, 'Vui lòng chọn deadline')
		.refine(
			(val) => !dayjs(val).isBefore(dayjs(), 'minute'), // So sánh đến cấp độ phút
			{
				message: 'Không thể chọn thời gian trong quá khứ',
			}
		),

	// Trạng thái: Gồm 3 trạng thái
	status: taskStatusSchema.default('To Do'),

	// Độ ưu tiên: Gồm 4 mức
	priority: taskPrioritySchema.default('Medium'),

	// Ngày tạo: Tự động ghi lại thời gian tạo
	createdAt: z.string().min(1),
})

export type Task = z.infer<typeof taskSchema>
export type TaskStatus = z.infer<typeof taskStatusSchema>
export type TaskPriority = z.infer<typeof taskPrioritySchema>