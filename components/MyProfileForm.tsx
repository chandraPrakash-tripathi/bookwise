'use client'
import { User, UserProfile } from '@/types';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Camera, BookOpen, User as UserIcon } from 'lucide-react';

interface Props {
  profile: Partial<UserProfile> | Partial<UserProfile>[];
  userDetails: Partial<User> | Partial<User>[];
}

const MyProfileForm = ({ profile, userDetails }: Props) => {
  // Handle both array and single object formats
  const userProfile = Array.isArray(profile) ? profile[0] || {} : profile;
  const userData = Array.isArray(userDetails) ? userDetails[0] || {} : userDetails;
  
  // State for form fields
  const [formData, setFormData] = useState({
    name: userData.fullName || '',
    email: userData.email || '',
    universityId: userData.universityId || '',
    universityCard: userData.universityCard || '',
    profilePicture: userData.profilePicture || '',
    bio: userData.bio || '',
    favoriteGenres: userProfile.favoriteGenres || [],
    favoriteAuthors: userProfile.favoriteAuthors || [],
    readingGoal: userProfile.readingGoal || 0
  });
  
  // For profile picture upload UI state
  const [isHoveringProfilePic, setIsHoveringProfilePic] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle comma-separated lists (genres, authors)
  const handleListChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const list = value.split(',').map(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [name]: list
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
  };

  return (
    <Card className="w-full shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-lg">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <UserIcon className="text-blue-600" />
          My Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Profile picture section at top */}
        <div className="flex flex-col items-center mb-8">
          <div 
            className="relative group"
            onMouseEnter={() => setIsHoveringProfilePic(true)}
            onMouseLeave={() => setIsHoveringProfilePic(false)}
          >
            <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-purple-200 shadow-md relative">
              {formData.profilePicture ? (
                <Image 
                  src={formData.profilePicture} 
                  alt="Profile Picture" 
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="bg-gradient-to-br from-blue-200 to-purple-300 h-full w-full flex items-center justify-center">
                  <UserIcon size={64} className="text-white" />
                </div>
              )}
            </div>
            
            {/* Edit overlay */}
            <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-40 transition-opacity duration-300 ${isHoveringProfilePic ? 'opacity-100' : 'opacity-0'}`}>
              <label htmlFor="profile-picture-upload" className="cursor-pointer p-3 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-all duration-300">
                <Camera size={24} className="text-purple-600" />
              </label>
              <input 
                id="profile-picture-upload" 
                name="profilePicture" 
                type="file"
                accept="image/*"
                onChange={handleChange} 
                className="hidden"
              />
            </div>
          </div>
          <h3 className="text-xl font-semibold mt-3">{formData.name}</h3>
          <p className="text-gray-500">{formData.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sections with visual dividers */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <UserIcon size={20} className="text-blue-600" />
              <h3 className="text-lg font-medium">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic information */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  placeholder="Your name"
                  disabled
                  className="border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="Your email"
                  disabled
                  className="border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>
              
              {/* Bio */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio" className="text-gray-700">Bio</Label>
                <Textarea 
                  id="bio" 
                  name="bio" 
                  value={formData.bio || ''} 
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  className="min-h-32 border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>
            </div>
          </div>
            
          {/* University details section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <BookOpen size={20} className="text-blue-600" />
              <h3 className="text-lg font-medium">University Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="universityId" className="text-gray-700">University ID</Label>
                <Input 
                  id="universityId" 
                  name="universityId" 
                  value={formData.universityId} 
                  onChange={handleChange}
                  placeholder="Your university ID"
                  disabled
                  className="border-gray-300"
                />
              </div>
              
              {/* University Card Display */}
              <div className="space-y-2">
                <Label className="text-gray-700">University Card</Label>
                {formData.universityCard && (
                  <div className="mt-2 relative h-40 w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <Image 
                      src={formData.universityCard} 
                      alt="University Card" 
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
            
          {/* Reading preferences section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <BookOpen size={20} className="text-blue-600" />
              <h3 className="text-lg font-medium">Reading Preferences</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="favoriteGenres" className="text-gray-700">Favorite Genres</Label>
                <Input 
                  id="favoriteGenres" 
                  name="favoriteGenres" 
                  value={Array.isArray(formData.favoriteGenres) ? formData.favoriteGenres.join(', ') : formData.favoriteGenres} 
                  onChange={handleListChange}
                  placeholder="Fiction, Fantasy, Mystery, etc. (comma separated)"
                  className="border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="favoriteAuthors" className="text-gray-700">Favorite Authors</Label>
                <Input 
                  id="favoriteAuthors" 
                  name="favoriteAuthors" 
                  value={Array.isArray(formData.favoriteAuthors) ? formData.favoriteAuthors.join(', ') : formData.favoriteAuthors} 
                  onChange={handleListChange}
                  placeholder="Author names (comma separated)"
                  className="border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="readingGoal" className="text-gray-700">Reading Goal (books per year)</Label>
                <Input 
                  id="readingGoal" 
                  name="readingGoal" 
                  type="number" 
                  value={formData.readingGoal || ''} 
                  onChange={handleChange}
                  placeholder="e.g., 12"
                  className="border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MyProfileForm;