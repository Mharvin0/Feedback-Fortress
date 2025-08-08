import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, 
    Save, 
    FileText, 
    AlertCircle, 
    Clock, 
    TrendingUp, 
    X,
    Upload,
    Eye,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedGrievanceFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    processing: boolean;
    errors: any;
    data: any;
    setData: (field: string, value: any) => void;
}

export default function EnhancedGrievanceForm({
    onSubmit,
    onCancel,
    processing,
    errors,
    data,
    setData
}: EnhancedGrievanceFormProps) {
    const [attachments, setAttachments] = useState<File[]>([]);
    const [draftSaved, setDraftSaved] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    const priorityOptions = [
        { value: 'low', label: 'Low', icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-100', selectedBg: 'bg-gray-600' },
        { value: 'normal', label: 'Normal', icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-100', selectedBg: 'bg-blue-600' },
        { value: 'high', label: 'High', icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-100', selectedBg: 'bg-orange-600' },
        { value: 'urgent', label: 'Urgent', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100', selectedBg: 'bg-red-600' }
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachments(prev => [...prev, ...files]);
        toast.success(`${files.length} file(s) added`);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
        toast.success('File removed');
    };

    const saveDraft = async () => {
        setIsSavingDraft(true);
        // Simulate draft saving
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDraftSaved(true);
        setIsSavingDraft(false);
        toast.success('Draft saved successfully');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.subject || !data.details || attachments.length === 0) {
            toast.error('Please fill in all required fields and attach at least one file');
            return;
        }
        onSubmit({ ...data, attachments });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl mx-auto"
        >
            <Card className="bg-white shadow-xl">
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl text-[#3A4F24]">Submit New Grievance</CardTitle>
                            <p className="text-gray-600 mt-2">Fill out the form below to submit your grievance or feedback</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Priority Selection */}
                        <div className="space-y-3">
                            <label className="block text-lg font-semibold text-gray-700">
                                Priority Level <span className="text-red-600">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {priorityOptions.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <Button
                                            key={option.value}
                                            type="button"
                                            variant="outline"
                                            className={`h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200 ${
                                                data.priority === option.value 
                                                    ? `${option.selectedBg} text-white border-2 border-transparent shadow-lg` 
                                                    : `${option.bgColor} border-2 border-gray-200 hover:border-gray-300 hover:shadow-md`
                                            }`}
                                            onClick={() => setData('priority', option.value)}
                                        >
                                            <Icon className={`h-5 w-5 ${data.priority === option.value ? 'text-white' : option.color}`} />
                                            <span className={`text-sm font-medium ${data.priority === option.value ? 'text-white' : 'text-gray-700'}`}>{option.label}</span>
                                        </Button>
                                    );
                                })}
                            </div>
                            {errors.priority && (
                                <p className="text-red-500 text-sm">{errors.priority}</p>
                            )}
                        </div>

                        {/* Type Selection */}
                        <div className="space-y-3">
                            <label className="block text-lg font-semibold text-gray-700">
                                Type <span className="text-red-600">*</span>
                            </label>
                            <Select
                                value={data.type}
                                onValueChange={(value) => setData('type', value)}
                            >
                                                                 <SelectTrigger className="text-lg h-14 focus:ring-2 focus:ring-[#3A4F24] bg-white text-black">
                                     <SelectValue placeholder="Select grievance type" />
                                 </SelectTrigger>
                                                                 <SelectContent className="bg-white border border-gray-200">
                                     <SelectItem value="complaint" className="text-black hover:bg-gray-100">Complaint</SelectItem>
                                     <SelectItem value="feedback" className="text-black hover:bg-gray-100">Feedback</SelectItem>
                                     <SelectItem value="suggestion" className="text-black hover:bg-gray-100">Suggestion</SelectItem>
                                     <SelectItem value="inquiry" className="text-black hover:bg-gray-100">Inquiry</SelectItem>
                                 </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-red-500 text-sm">{errors.type}</p>
                            )}
                        </div>

                        {/* Subject */}
                        <div className="space-y-3">
                            <label className="block text-lg font-semibold text-gray-700">
                                Subject <span className="text-red-600">*</span>
                            </label>
                                                         <Input
                                 type="text"
                                 placeholder="Enter a clear and concise subject"
                                 value={data.subject}
                                 onChange={(e) => setData('subject', e.target.value)}
                                 className="text-lg h-14 focus:ring-2 focus:ring-[#3A4F24] bg-white text-black"
                                 minLength={8}
                                 required
                             />
                            {errors.subject && (
                                <p className="text-red-500 text-sm">{errors.subject}</p>
                            )}
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                            <label className="block text-lg font-semibold text-gray-700">
                                Details <span className="text-red-600">*</span>
                            </label>
                                                         <Textarea
                                 placeholder="Provide detailed information about your grievance..."
                                 value={data.details}
                                 onChange={(e) => setData('details', e.target.value)}
                                 className="min-h-[200px] text-lg focus:ring-2 focus:ring-[#3A4F24] bg-white text-black"
                                 required
                             />
                            {errors.details && (
                                <p className="text-red-500 text-sm">{errors.details}</p>
                            )}
                        </div>

                        {/* File Attachments */}
                        <div className="space-y-3">
                            <label className="block text-lg font-semibold text-gray-700">
                                Attachments <span className="text-red-600">*</span>
                            </label>
                                                         <div 
                                 className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#3A4F24] transition-colors cursor-pointer"
                                 onDrop={(e) => {
                                     e.preventDefault();
                                     const files = Array.from(e.dataTransfer.files);
                                     setAttachments(prev => [...prev, ...files]);
                                     toast.success(`${files.length} file(s) added`);
                                 }}
                                 onDragOver={(e) => e.preventDefault()}
                                 onClick={() => document.getElementById('file-upload')?.click()}
                             >
                                 <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                 <div className="space-y-2">
                                     <p className="text-lg font-medium text-gray-700">
                                         Drop files here or click to upload
                                     </p>
                                     <p className="text-sm text-gray-500">
                                         Supports: PDF, DOC, DOCX, XLS, XLSX, TXT, Images (max 10MB each)
                                     </p>
                                     <input
                                         type="file"
                                         multiple
                                         accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
                                         onChange={handleFileUpload}
                                         className="hidden"
                                         id="file-upload"
                                     />
                                     <Button type="button" variant="outline" className="mt-2">
                                         Choose Files
                                     </Button>
                                 </div>
                             </div>
                            
                            {/* File List */}
                            {attachments.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium text-gray-700">Selected Files:</h4>
                                    {attachments.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{file.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeAttachment(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                            <div className="flex-1 flex flex-col sm:flex-row gap-3">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-[#3A4F24] hover:bg-[#2c3a18] text-white h-12 text-lg font-semibold"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-5 w-5" />
                                            Submit Grievance
                                        </>
                                    )}
                                </Button>
                                
                                                                 <Button
                                     type="button"
                                     variant="outline"
                                     onClick={saveDraft}
                                     disabled={isSavingDraft}
                                     className="flex-1 h-12 text-lg font-semibold border-orange-500 text-orange-600 bg-white hover:bg-orange-500 hover:text-white"
                                 >
                                    {isSavingDraft ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3A4F24] mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-5 w-5" />
                                            Save Draft
                                        </>
                                    )}
                                </Button>
                            </div>
                            
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onCancel}
                                className="h-12 text-lg font-semibold text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </Button>
                        </div>

                        {/* Draft Saved Indicator */}
                        <AnimatePresence>
                            {draftSaved && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        <p className="text-green-800 font-medium">Draft saved successfully</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
} 