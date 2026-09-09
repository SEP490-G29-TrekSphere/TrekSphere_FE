import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Loader2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants/paths';
import { useTours } from '@/features/tours/hooks/useTours';
import { toast } from '@/store/useToastStore';
import { MATCHING_GROUP_LOOKUP_PAGE_SIZE } from '../../constants';
import { useCreateMatchingGroup } from '../../hooks/useCreateMatchingGroup';
import { toTourMatchingGroupCreateRequest } from '../../mappers';
import {
  CREATE_TOUR_MATCHING_GROUP_DEFAULT_VALUES,
  type CreateTourMatchingGroupFormInput,
  type CreateTourMatchingGroupFormValues,
  createTourMatchingGroupSchema,
} from '../../validations';
import { CreateMatchingGroupFields } from './CreateMatchingGroupFields';

interface CreateMatchingGroupFormProps {
  onCancel: () => void;
}

export function CreateMatchingGroupForm({ onCancel }: CreateMatchingGroupFormProps) {
  const navigate = useNavigate();
  const createMutation = useCreateMatchingGroup();
  const { tours, isLoading: isToursLoading } = useTours({
    page: 0,
    size: MATCHING_GROUP_LOOKUP_PAGE_SIZE,
  });
  const form = useForm<
    CreateTourMatchingGroupFormInput,
    undefined,
    CreateTourMatchingGroupFormValues
  >({
    resolver: zodResolver(createTourMatchingGroupSchema),
    defaultValues: CREATE_TOUR_MATCHING_GROUP_DEFAULT_VALUES,
  });

  async function handleSubmit(values: CreateTourMatchingGroupFormValues) {
    try {
      const group = await createMutation.mutateAsync(toTourMatchingGroupCreateRequest(values));
      toast.success('Tạo nhóm đồng hành thành công! Nhóm của bạn đã được đăng công khai.');
      form.reset();
      onCancel();
      navigate(`${PATHS.GROUPS}/${group.matchingGroupId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Tạo nhóm thất bại. Vui lòng thử lại.');
    }
  }

  const isPending = createMutation.isPending;

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <form
          id="create-matching-group-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 px-6 py-6"
        >
          <CreateMatchingGroupFields
            form={form}
            tours={tours}
            isToursLoading={isToursLoading}
            isPending={isPending}
          />
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nhóm của bạn sẽ được hiển thị công khai ngay sau khi tạo. Các thành viên khác có thể
              gửi yêu cầu tham gia và bạn sẽ quyết định chấp nhận hay từ chối.
            </p>
          </div>
        </form>
      </div>

      <div className="flex flex-col-reverse justify-end gap-3 border-border border-t bg-muted/20 px-6 py-4 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg border border-input bg-background px-6 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          form="create-matching-group-form"
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span>{isPending ? 'Đang tạo...' : 'Tạo nhóm'}</span>
        </button>
      </div>
    </>
  );
}
