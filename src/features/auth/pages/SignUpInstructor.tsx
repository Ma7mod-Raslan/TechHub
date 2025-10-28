import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Type تعريف لشكل بيانات التسجيل للمُعلّم
interface InstructorSignUpData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    expertiseArea: string; // مجال الخبرة
    bio: string;           // نبذة عني
    // file: File | null;   // لملف الـCV
}

const SignUpInstructor: React.FC = () => {
    // State لتخزين بيانات الفورم
    const [formData, setFormData] = useState<InstructorSignUpData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        expertiseArea: '',
        bio: '',
        // file: null,
    });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // دالة لتحديث الـState عند إدخال البيانات
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // تحديث الـState باستخدام اسم الحقل
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // دالة للتعامل مع إرسال الفورم (اللوجيك سيضاف لاحقاً)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        if (loading) return;

        // ⚠️ هنا سيتم استدعاء لوجيك الـSignUp/Verification لاحقاً
        setLoading(true);
        console.log('Instructor Sign Up Data:', formData);

        // محاكاة لعملية إرسال طلب المُعلّم (للتجربة البصرية)
        setTimeout(() => {
            setLoading(false);
            // navigate('/signup-success/instructor'); // التوجيه لصفحة انتظار الموافقة
        }, 2000);
    };

    // تعريف نوع حقل الإدخال لـ(Input)
    type InputChangeType = React.ChangeEvent<HTMLInputElement>;
    // تعريف نوع حقل الإدخال لـ(TextArea)
    type TextAreaChangeType = React.ChangeEvent<HTMLTextAreaElement>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
                    Apply to Become an Instructor
                </h2>
                <p className="text-center text-gray-500 mb-8">
                    Your application will be reviewed by our team.
                </p>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    {/* حقول الطالب الأساسية */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input id="fullName" name="fullName" type="text" required value={formData.fullName} onChange={handleChange as (e: InputChangeType) => void} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange as (e: InputChangeType) => void} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange as (e: InputChangeType) => void} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange as (e: InputChangeType) => void} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                    </div>
                    
                    {/* حقول المُعلّم الإضافية */}
                    <div>
                        <label htmlFor="expertiseArea" className="block text-sm font-medium text-gray-700">Main Area of Expertise (e.g., React, Data Science)</label>
                        <input
                            id="expertiseArea"
                            name="expertiseArea"
                            type="text"
                            required
                            value={formData.expertiseArea}
                            onChange={handleChange as (e: InputChangeType) => void}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Professional Bio (Minimum 100 characters)</label>
                        <textarea
                            id="bio"
                            name="bio"
                            required
                            value={formData.bio}
                            onChange={handleChange as (e: TextAreaChangeType) => void}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    
                    {/* حقل رفع الملف (CV) */}
                    <div>
                        <label htmlFor="cvUpload" className="block text-sm font-medium text-gray-700">Upload CV/Resume (PDF or DOCX)</label>
                        <input
                            id="cvUpload"
                            name="cvUpload"
                            type="file"
                            accept=".pdf,.docx"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        />
                    </div>

                    {/* زر الإرسال */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-600">
                        Already have an account? {' '}
                        <Link to="/signin" className="font-medium text-green-600 hover:text-green-500">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpInstructor;
