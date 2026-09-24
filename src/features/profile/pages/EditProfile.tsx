import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PATHS } from '@/constants';
import type { UserProfile } from '@/features/auth';
import {
  type UpdateProfileFormValues,
  updateProfileSchema,
} from '@/features/auth/validations/auth.schema';
import { AppButton, AppSpinner, PortalPageHeader } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { normalizePhoneNumber } from '@/utils/phone';
import { HikingProfileFields } from '../components/edit/HikingProfileFields';
import { PersonalInfoFields } from '../components/edit/PersonalInfoFields';
import ProfileSidebar from '../components/ProfileSidebar';
import { normalizeProfile, profileKeys, useProfile } from '../hooks/useProfile';
import { profileService } from '../services/profileService';

function toFormValues(profile?: UserProfile | null): UpdateProfileFormValues {
  return {
    name: profile?.name ?? '',
    phone: normalizePhoneNumber(profile?.phone) || (profile?.phone ?? ''),
    gender: profile?.gender,
    dateOfBirth: profile?.dateOfBirth ?? '',
    bio: profile?.bio ?? '',
    experienceLevel: (profile?.experienceLevel ?? '') as UpdateProfileFormValues['experienceLevel'],
    preferredDifficulty: (profile?.preferredDifficulty ??
      '') as UpdateProfileFormValues['preferredDifficulty'],
    preferredAreas: profile?.preferredAreas ?? [],
    skills: profile?.skills ?? [],
    emergencyContactName: profile?.emergencyContactName ?? '',
    emergencyContactPhone:
      normalizePhoneNumber(profile?.emergencyContactPhone) ||
      (profile?.emergencyContactPhone ?? ''),
  };
}

function buildProfileFormData(data: UpdateProfileFormValues, avatar: File | null): FormData {
  const formData = new FormData();
  formData.append('fullName', data.name);
  if (data.phone) formData.append('phone', normalizePhoneNumber(data.phone));
  if (data.dateOfBirth) formData.append('dateOfBirth', data.dateOfBirth);
  if (data.gender) formData.append('gender', data.gender.toUpperCase());

  formData.append('bio', data.bio ?? '');
  if (data.experienceLevel) formData.append('experienceLevel', data.experienceLevel);
  if (data.preferredDifficulty) formData.append('preferredDifficulty', data.preferredDifficulty);
  appendList(formData, 'preferredAreas', data.preferredAreas);
  appendList(formData, 'skills', data.skills);

  if (data.emergencyContactName !== undefined) {
    formData.append('emergencyContactName', data.emergencyContactName.trim());
  }
  if (data.emergencyContactPhone !== undefined) {
    formData.append(
      'emergencyContactPhone',
      data.emergencyContactPhone ? normalizePhoneNumber(data.emergencyContactPhone) : ''
    );
  }

  if (avatar) formData.append('avatar', avatar);

  return formData;
}

function appendList(formData: FormData, field: string, items?: string[]) {
  const values = (items ?? []).map((item) => item.trim()).filter(Boolean);
  if (values.length === 0) {
    formData.append(field, '');
    return;
  }
  for (const value of values) formData.append(field, value);
}

export default function EditProfile({ returnPath }: { returnPath?: string }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const setUser = useAppStore((state) => state.setUser);

  const effectiveReturnPath = searchParams.get('returnUrl') || returnPath || PATHS.PROFILE;

  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: profile, isLoading } = useProfile();

  const methods = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: toFormValues(profile),
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Reset form khi load xong data
  useEffect(() => {
    if (!profile) return;
    reset(toFormValues(profile));
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileFormValues) =>
      profileService.updateProfile(buildProfileFormData(data, selectedAvatarFile)),
    onSuccess: (res) => {
      if (res.error || (res.status && res.status >= 400)) {
        const errorMsg =
          (res as { errors?: { message: string }[] }).errors?.[0]?.message ||
          res.message ||
          res.error ||
          'Cập nhật thất bại. Vui lòng thử lại.';
        toast.error(errorMsg);
        return;
      }
      toast.success('Cập nhật hồ sơ thành công!');

      if (res.data) {
        const updatedUser = normalizeProfile(res.data as unknown as Record<string, unknown>);

        const currentUser = useAppStore.getState().user;
        setUser({
          id: updatedUser.id || (currentUser?.id ?? ''),
          name: updatedUser.name || (currentUser?.name ?? ''),
          email: updatedUser.email || currentUser?.email,
          avatarUrl: updatedUser.avatar ?? currentUser?.avatarUrl,
          roles: updatedUser.roles.length > 0 ? updatedUser.roles : currentUser?.roles,
        });
        queryClient.setQueryData(profileKeys.me(), updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      navigate(effectiveReturnPath);
    },
    onError: (err) => {
      const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(errorMsg);
    },
  });

  const onSubmit = (data: UpdateProfileFormValues) => {
    updateMutation.mutate(data);
  };

  const onInvalid = (formErrors: Record<string, unknown>) => {
    const errorList = Object.values(formErrors) as { message?: string }[];
    const firstMsg = errorList.find((e) => e?.message)?.message;
    if (firstMsg) {
      toast.error(firstMsg);
    } else {
      toast.error('Vui lòng kiểm tra lại các trường thông tin chưa hợp lệ.');
    }
  };

  const handleCancel = () => {
    navigate(effectiveReturnPath);
  };

  const handleAvatarChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh tối đa 5MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setSelectedAvatarFile(file);
  };

  // Render
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <AppSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  const previewProfile: UserProfile = {
    id: profile?.id ?? '',
    name: profile?.name ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone,
    avatar: avatarPreview || profile?.avatar,
    gender: profile?.gender,
    dateOfBirth: profile?.dateOfBirth,
    roles: profile?.roles ?? [],
    role: profile?.role ?? '',
  };

  return (
    <div className="w-full space-y-6 pb-8">
      <PortalPageHeader
        title="Chỉnh sửa hồ sơ"
        description="Cập nhật thông tin cá nhân của bạn"
        backButton={{ to: returnPath ?? PATHS.PROFILE, label: 'Quay lại' }}
      />

      {/* 2-column layout: sidebar (30%) + form (70%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <ProfileSidebar
            profile={previewProfile}
            mode="edit"
            onAvatarChange={handleAvatarChange}
          />
        </div>

        {/* Form */}
        <div className="lg:col-span-7">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
              <PersonalInfoFields email={profile?.email} />

              <HikingProfileFields />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="rounded-xl border-2 border-primary bg-transparent px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
                >
                  Hủy
                </button>
                <AppButton
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="rounded-xl px-6 py-2.5"
                >
                  {isSubmitting || updateMutation.isPending ? (
                    <>
                      <AppSpinner size="sm" className="text-primary-foreground" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </AppButton>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
