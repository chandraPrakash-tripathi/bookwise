"use client";
import { User, UserProfile, DeliveryAddress } from "@/types";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import {
  Camera,
  BookOpen,
  User as UserIcon,
  Check,
  MapPin,
  Plus,
  Trash2,
  Home,
} from "lucide-react";
import {
  updateUserProfile,
  getUserDeliveryAddresses,
  deleteDeliveryAddress,
} from "@/lib/actions/profile";
import { toast } from "sonner";

interface Props {
  profile: Partial<UserProfile> | Partial<UserProfile>[];
  userDetails: Partial<User> | Partial<User>[];
  addresses?: DeliveryAddress[];
}

const MyProfileForm = ({ profile, userDetails, addresses }: Props) => {
  // Handle both array and single object formats
  const userProfile = Array.isArray(profile) ? profile[0] || {} : profile;
  const userData = Array.isArray(userDetails)
    ? userDetails[0] || {}
    : userDetails;

  // State for form fields
  const [formData, setFormData] = useState({
    name: userData.fullName || "",
    email: userData.email || "",
    universityId: userData.universityId || "",
    universityCard: userData.universityCard || "",
    profilePicture: userData.profilePicture || "",
    bio: userData.bio || "",
    favoriteGenres: userProfile.favoriteGenres || [],
    favoriteAuthors: userProfile.favoriteAuthors || [],
    readingGoal: userProfile.readingGoal || 0,
  });

  // For address section
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>(
    addresses || []
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [, setSelectedAddressId] = useState<string | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    id: "",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isDefault: false,
  });

  // Fetch addresses if not provided as props
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!addresses) {
        const result = await getUserDeliveryAddresses();
        if (result.success) {
          // Cast to ensure TypeScript knows we're handling the nullable fields
          setDeliveryAddresses(result.addresses as DeliveryAddress[]);

          // If there's at least one address, select it as default for the form
          if (result.addresses.length > 0) {
            const defaultAddress =
              result.addresses.find((addr) => addr.isDefault) ||
              result.addresses[0];
            setSelectedAddressId(defaultAddress.id);
          }
        }
      } else {
        setDeliveryAddresses(addresses);
        if (addresses.length > 0) {
          const defaultAddress =
            addresses.find((addr) => addr.isDefault) || addresses[0];
          setSelectedAddressId(defaultAddress.id);
        }
      }
    };

    fetchAddresses();
  }, [addresses]);

  // For profile picture upload UI state
  const [isHoveringProfilePic, setIsHoveringProfilePic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setProfileImage] = useState<File | null>(null);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            profilePicture: event.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle comma-separated lists (genres, authors)
  const handleListChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const list = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    setFormData((prev) => ({
      ...prev,
      [name]: list,
    }));
  };

  // Address form handlers
  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAddressFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressCheckboxChange = (checked: boolean) => {
    setAddressFormData((prev) => ({
      ...prev,
      isDefault: checked,
    }));
  };

  const handleEditAddress = (address: DeliveryAddress) => {
    setAddressFormData({
      id: address.id,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault || false,
    });
    setShowAddressForm(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleNewAddress = () => {
    setAddressFormData({
      id: "",
      fullName: userData.fullName || "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      isDefault: deliveryAddresses.length === 0, // Make default if first address
    });
    setShowAddressForm(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      const result = await deleteDeliveryAddress(id);
      if (result.success) {
        setDeliveryAddresses((prev) => prev.filter((addr) => addr.id !== id));
        toast.success("Your delivery address has been removed.");
      } else {
        toast.error(
          result.error || "Failed to delete address. Please try again."
        );
      }
    }
  };

  const handleAddressSave = () => {
    // Save address data through the main form submission
    handleSubmit(new Event("submit") as unknown as React.FormEvent);
  };

  const handleCancelAddress = () => {
    setShowAddressForm(false);
    setAddressFormData({
      id: "",
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      isDefault: false,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get selected address if any
      let deliveryAddress = undefined;

      if (
        showAddressForm &&
        addressFormData.fullName &&
        addressFormData.addressLine1
      ) {
        deliveryAddress = {
          id: addressFormData.id || undefined,
          fullName: addressFormData.fullName,
          phone: addressFormData.phone,
          addressLine1: addressFormData.addressLine1,
          addressLine2: addressFormData.addressLine2 || undefined,
          city: addressFormData.city,
          state: addressFormData.state,
          zipCode: addressFormData.zipCode,
          country: addressFormData.country,
          isDefault: addressFormData.isDefault,
        };
      }

      // Create form data for submission
      const profileUpdateData = {
        bio: formData.bio,
        profilePicture: formData.profilePicture,
        favoriteGenres: formData.favoriteGenres,
        favoriteAuthors: formData.favoriteAuthors,
        readingGoal: Number(formData.readingGoal),
        deliveryAddress,
      };

      // Call the server action
      const result = await updateUserProfile(profileUpdateData);

      if (result.success) {
        toast.success("Your profile has been updated successfully.");

        // Refresh addresses
        const addressesResult = await getUserDeliveryAddresses();
        if (addressesResult.success) {
          // Cast to ensure TypeScript knows we're handling the nullable fields
          setDeliveryAddresses(addressesResult.addresses as DeliveryAddress[]);
        }

        // Reset address form
        setShowAddressForm(false);
      } else {
        toast.error(
          result.error || "Failed to update profile. Please try again."
        );
        console.error("Profile update error:", result.error);
      }
    } catch (error) {
      toast.error(
        "An error occurred while updating your profile. Please try again."
      );
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
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
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="bg-gradient-to-br from-blue-200 to-purple-300 h-full w-full flex items-center justify-center">
                  <UserIcon size={64} className="text-white" />
                </div>
              )}
            </div>

            {/* Edit overlay */}
            <div
              className={`absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-40 transition-opacity duration-300 ${
                isHoveringProfilePic ? "opacity-100" : "opacity-0"
              }`}
            >
              <label
                htmlFor="profile-picture-upload"
                className="cursor-pointer p-3 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-all duration-300"
              >
                <Camera size={24} className="text-purple-600" />
              </label>
              <input
                id="profile-picture-upload"
                name="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
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
                <Label htmlFor="name" className="text-gray-700">
                  Name
                </Label>
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
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
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
                <Label htmlFor="bio" className="text-gray-700">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  className="min-h-32 border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Rest of the component remains the same... */}
          {/* University details section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <BookOpen size={20} className="text-blue-600" />
              <h3 className="text-lg font-medium">University Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="universityId" className="text-gray-700">
                  University ID
                </Label>
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
                      style={{ objectFit: "contain" }}
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
                <Label htmlFor="favoriteGenres" className="text-gray-700">
                  Favorite Genres
                </Label>
                <Input
                  id="favoriteGenres"
                  name="favoriteGenres"
                  value={
                    Array.isArray(formData.favoriteGenres)
                      ? formData.favoriteGenres.join(", ")
                      : formData.favoriteGenres
                  }
                  onChange={handleListChange}
                  placeholder="Fiction, Fantasy, Mystery, etc. (comma separated)"
                  className="border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteAuthors" className="text-gray-700">
                  Favorite Authors
                </Label>
                <Input
                  id="favoriteAuthors"
                  name="favoriteAuthors"
                  value={
                    Array.isArray(formData.favoriteAuthors)
                      ? formData.favoriteAuthors.join(", ")
                      : formData.favoriteAuthors
                  }
                  onChange={handleListChange}
                  placeholder="Author names (comma separated)"
                  className="border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="readingGoal" className="text-gray-700">
                  Reading Goal (books per year)
                </Label>
                <Input
                  id="readingGoal"
                  name="readingGoal"
                  type="number"
                  value={formData.readingGoal || ""}
                  onChange={handleChange}
                  placeholder="e.g., 12"
                  className="border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Delivery Addresses Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <MapPin size={20} className="text-blue-600" />
              <h3 className="text-lg font-medium">Delivery Addresses</h3>
            </div>

            {/* Existing addresses */}
            {deliveryAddresses.length > 0 ? (
              <div className="space-y-4">
                {deliveryAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 border rounded-lg relative ${
                      address.isDefault
                        ? "border-purple-300 bg-purple-50"
                        : "border-gray-200"
                    }`}
                  >
                    {address.isDefault && (
                      <div className="absolute -top-2 -right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Default
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium flex items-center gap-1">
                          <Home size={16} className="text-purple-500" />
                          {address.fullName}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {address.phone}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {address.addressLine1}
                        </p>
                        {address.addressLine2 && (
                          <p className="text-sm text-gray-600">
                            {address.addressLine2}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.country}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => handleEditAddress(address)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <MapPin size={32} className="mx-auto text-gray-400" />
                <h4 className="mt-2 text-gray-600">
                  No delivery addresses found
                </h4>
                <p className="text-gray-500 text-sm mt-1">
                  Add a delivery address for your book orders
                </p>
              </div>
            )}

            {!showAddressForm && (
              <div className="flex justify-center mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50"
                  onClick={handleNewAddress}
                >
                  <Plus size={16} />
                  Add New Address
                </Button>
              </div>
            )}

            {/* Address form */}
            {showAddressForm && (
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50 shadow-sm">
                <h4 className="font-medium text-purple-700 border-b border-purple-200 pb-2 mb-4">
                  {addressFormData.id ? "Edit Address" : "Add New Address"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressFullName" className="text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      id="addressFullName"
                      name="fullName"
                      value={addressFormData.fullName}
                      onChange={handleAddressChange}
                      placeholder="Full Name"
                      className="border-gray-300 focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressPhone" className="text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="addressPhone"
                      name="phone"
                      value={addressFormData.phone}
                      onChange={handleAddressChange}
                      placeholder="Phone Number"
                      className="border-gray-300 focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="addressLine1" className="text-gray-700">
                      Address Line 1
                    </Label>
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      value={addressFormData.addressLine1}
                      onChange={handleAddressChange}
                      placeholder="Street Address, P.O. Box"
                      className="border-gray-300 focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="addressLine2" className="text-gray-700">
                      Address Line 2 (Optional)
                    </Label>
                    <Input
                      id="addressLine2"
                      name="addressLine2"
                      value={addressFormData.addressLine2}
                      onChange={handleAddressChange}
                      placeholder="Apartment, Suite, Unit, Building, Floor, etc."
                      className="border-gray-300 focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressCity" className="text-gray-700">
                      City
                    </Label>
                    <Input
                      id="addressCity"
                      name="city"
                      value={addressFormData.city}
                      onChange={handleAddressChange}
                      placeholder="City"
                      className="border-gray-300 focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressState" className="text-gray-700">
                      State/Province
                    </Label>
                    <Input
                      id="addressState"
                      name="state"
                      value={addressFormData.state}
                      onChange={handleAddressChange}
                      placeholder="State/Province"
                      className="border-gray-300 focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressZipCode" className="text-gray-700">
                      Zip/Postal Code
                    </Label>
                    <Input
                      id="addressZipCode"
                      name="zipCode"
                      value={addressFormData.zipCode}
                      onChange={handleAddressChange}
                      placeholder="Zip/Postal Code"
                      className="border-gray-300 focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressCountry" className="text-gray-700">
                      Country
                    </Label>
                    <Input
                      id="addressCountry"
                      name="country"
                      value={addressFormData.country}
                      onChange={handleAddressChange}
                      placeholder="Country"
                      className="border-gray-300 focus:border-purple-400"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2 mt-2">
                    <Checkbox
                      id="isDefault"
                      checked={addressFormData.isDefault}
                      onCheckedChange={handleAddressCheckboxChange}
                      className="border-purple-300 data-[state=checked]:bg-purple-500"
                    />
                    <Label
                      htmlFor="isDefault"
                      className="text-gray-700 cursor-pointer"
                    >
                      Set as default address
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelAddress}
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddressSave}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Save Address
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check size={16} />
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MyProfileForm;
