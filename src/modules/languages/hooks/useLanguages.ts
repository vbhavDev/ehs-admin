import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { languagesService } from '../services/languages.service';
import {
  QueryLanguageDto,
  CreateLanguageDto,
  UpdateLanguageDto,
  MessageRecord,
} from '../types/languages.types';
import toast from 'react-hot-toast';

export const useLanguages = (params: QueryLanguageDto = {}) => {
  const queryClient = useQueryClient();

  const languagesQuery = useQuery({
    queryKey: ['languages', params],
    queryFn: () => languagesService.getLanguages(params),
  });

  const createLanguageMutation = useMutation({
    mutationFn: (data: CreateLanguageDto) => languagesService.createLanguage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast.success('Language added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add language');
    },
  });

  const updateLanguageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLanguageDto }) =>
      languagesService.updateLanguage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast.success('Language updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update language');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      languagesService.toggleLanguageStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast.success(variables.isActive ? 'Language activated' : 'Language deactivated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle status');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => languagesService.setDefaultLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast.success('Primary default language updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set default language');
    },
  });

  const deleteLanguageMutation = useMutation({
    mutationFn: (id: string) => languagesService.deleteLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast.success('Language deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete language');
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: ({
      code,
      file,
      mode = 'merge',
    }: {
      code: string;
      file: File;
      mode?: 'merge' | 'replace';
    }) => languagesService.uploadCatalogFile(code, file, mode),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast.success(`Catalog updated (${data.totalKeys} keys synchronized)`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to import JSON catalog');
    },
  });

  const importCatalogMutation = useMutation({
    mutationFn: ({
      code,
      messages,
      mode = 'replace',
    }: {
      code: string;
      messages: MessageRecord;
      mode?: 'merge' | 'replace';
    }) => languagesService.importCatalog(code, messages, mode),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast.success(`Catalog saved successfully (${data.totalKeys} keys active)`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save translation catalog');
    },
  });

  const aiGenerateMutation = useMutation({
    mutationFn: languagesService.generateAiTranslation,
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate AI translation');
    },
  });

  return {
    languages: languagesQuery.data?.data || [],
    meta: languagesQuery.data?.meta,
    isLoading: languagesQuery.isLoading,
    isError: languagesQuery.isError,
    error: languagesQuery.error,
    createLanguage: createLanguageMutation.mutateAsync,
    updateLanguage: updateLanguageMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    setDefault: setDefaultMutation.mutateAsync,
    deleteLanguage: deleteLanguageMutation.mutateAsync,
    downloadCatalog: languagesService.downloadCatalog,
    uploadCatalogFile: uploadFileMutation.mutateAsync,
    importCatalog: importCatalogMutation.mutateAsync,
    generateAiTranslation: aiGenerateMutation.mutateAsync,
    isUploading: uploadFileMutation.isPending || importCatalogMutation.isPending,
    isGeneratingAi: aiGenerateMutation.isPending,
  };
};
