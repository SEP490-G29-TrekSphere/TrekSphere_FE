import { type Control, Controller, type FieldErrors } from 'react-hook-form';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import type { TourFormInput } from '../../validations';

interface TourDescriptionSectionProps {
  control: Control<TourFormInput>;
  errors: FieldErrors<TourFormInput>;
}

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

export function TourDescriptionSection({ control, errors }: TourDescriptionSectionProps) {
  return (
    <section className="space-y-3 rounded-3xl border border-border bg-card p-6 lg:col-span-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Lịch trình chi tiết
      </h3>

      <div
        className={`overflow-hidden rounded-3xl border bg-card [&_.quill]:flex [&_.quill]:h-[400px] [&_.quill]:flex-col [&_.quill]:border-none [&_.ql-container]:!border-none [&_.ql-container]:flex-1 [&_.ql-container]:overflow-y-auto [&_.ql-container]:font-inherit [&_.ql-container]:text-sm [&_.ql-toolbar]:!border-none [&_.ql-toolbar]:!border-b [&_.ql-toolbar]:!border-border [&_.ql-editor.ql-blank::before]:not-italic [&_.ql-editor.ql-blank::before]:text-muted-foreground lg:[&_.quill]:h-[450px] ${
          errors.description ? 'border-destructive' : 'border-border'
        }`}
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <ReactQuill
              theme="snow"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              modules={QUILL_MODULES}
              placeholder="Mô tả lịch trình chi tiết từng ngày, các điểm dừng chân, dịch vụ bao gồm và lưu ý quan trọng..."
            />
          )}
        />
      </div>
      {errors.description && (
        <p className="text-xs text-destructive">{errors.description.message}</p>
      )}
    </section>
  );
}
