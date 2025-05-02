"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { BorrowHistory } from '@/types';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, Search, Filter, User, ChevronRight, BookOpen, Camera, FileText, Eye, Download } from 'lucide-react';

interface MembersHistoryProps {
  membersHistory: BorrowHistory[];
}

// Define an interface for grouped records
interface GroupedUser {
  userId: string;
  fullName: string;
  email: string;
  universityId: string;
  universityCard: string | null;
  profilePicture: string | null;
  borrowRecords: BorrowHistory[];
}

const MembersHistory: React.FC<MembersHistoryProps> = ({ membersHistory }) => {
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<BorrowHistory | null>(null);
  const [activeTab, setActiveTab] = useState<'user' | 'book' | 'condition' | 'receipt'>('user');

  // Group records by user
  const groupedRecords = useMemo(() => {
    // First, filter based on search and status filter
    const filteredRecords = membersHistory.filter(record => {
      // Apply status filter
      if (statusFilter !== 'all' && record.status !== statusFilter) {
        return false;
      }
      
      // Apply search filter (case insensitive)
      const searchLower = search.toLowerCase();
      return (
        record.fullName.toLowerCase().includes(searchLower) ||
        record.email.toLowerCase().includes(searchLower) ||
        record.bookTitle.toLowerCase().includes(searchLower) ||
        record.bookAuthor.toLowerCase().includes(searchLower) ||
        (record.bookIsbn && record.bookIsbn.toLowerCase().includes(searchLower))
      );
    });

    // Then group by user (assuming each record has a userId or similar identifier)
    const userMap = new Map<string, GroupedUser>();
    
    filteredRecords.forEach(record => {
      // Generate a unique key for each user - using email as it's likely unique
      const userKey = record.email;
      
      if (!userMap.has(userKey)) {
        userMap.set(userKey, {
          userId: userKey,
          fullName: record.fullName,
          email: record.email,
          universityId: record.universityId.toString(),
          universityCard: record.universityCard,
          profilePicture: record.profilePicture || null,
          borrowRecords: []
        });
      }
      
      userMap.get(userKey)?.borrowRecords.push(record);
    });
    
    // Convert map to array for rendering
    return Array.from(userMap.values());
  }, [membersHistory, search, statusFilter]);

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-200 text-yellow-800';
      case 'APPROVED': return 'bg-blue-200 text-blue-800';
      case 'REJECTED': return 'bg-red-200 text-red-800';
      case 'BORROW': return 'bg-green-200 text-green-800';
      case 'RETURNED': return 'bg-purple-200 text-purple-800';
      case 'OVERDUE': return 'bg-pink-200 text-pink-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  // Format date or show placeholder
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'dd MMM yyyy');
  };

  // Toggle expanded state for a user
  const toggleUserExpanded = (userId: string) => {
    const newExpandedUsers = new Set(expandedUsers);
    if (newExpandedUsers.has(userId)) {
      newExpandedUsers.delete(userId);
    } else {
      newExpandedUsers.add(userId);
    }
    setExpandedUsers(newExpandedUsers);
  };
  
  // Handle view details
  const handleViewDetails = (record: BorrowHistory) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
    setActiveTab('user');
  };

  // Get total number of records across all filtered users
  const totalRecordsCount = useMemo(() => {
    return groupedRecords.reduce((total, user) => total + user.borrowRecords.length, 0);
  }, [groupedRecords]);

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <h2 className="text-xl font-semibold">Borrowing History</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search members or books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Status: {statusFilter === 'all' ? 'All' : statusFilter}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('PENDING')}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('APPROVED')}>Approved</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('REJECTED')}>Rejected</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('BORROW')}>Borrowed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('RETURNED')}>Returned</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('OVERDUE')}>Overdue</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {groupedRecords.length} users with {totalRecordsCount} borrowing records
      </div>

      {/* User-grouped Table */}
      <div className="overflow-x-auto border rounded-lg">
        <div className="min-w-full">
          {groupedRecords.length > 0 ? (
            <div className="divide-y">
              {groupedRecords.map((user) => (
                <div key={user.userId} className="bg-white">
                  {/* User Header Row */}
                  <div 
                    className="flex items-center p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleUserExpanded(user.userId)}
                  >
                    <div className="mr-2">
                      <ChevronRight 
                        className={`h-5 w-5 text-gray-500 transition-transform ${expandedUsers.has(user.userId) ? 'rotate-90' : ''}`} 
                      />
                    </div>
                    
                    <div className="flex items-center flex-grow">
                      {/* Profile Picture */}
                      <div className="mr-4">
                        {user.profilePicture ? (
                          <Image 
                            src={user.profilePicture} 
                            alt={user.fullName}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-grow">
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      
                      {/* University ID */}
                      <div className="hidden md:block text-sm text-gray-600 mr-4">
                        <div>University ID: {user.universityId}</div>
                        {user.universityCard && <div>Card: {user.universityCard}</div>}
                      </div>
                      
                      {/* Borrow Count */}
                      <div className="text-sm">
                        <Badge variant="outline">{user.borrowRecords.length} {user.borrowRecords.length === 1 ? 'book' : 'books'}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Borrowing Records Table - Visible when expanded */}
                  {expandedUsers.has(user.userId) && (
                    <div className="pl-10 pr-4 pb-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Book</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Borrow Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Return Date</TableHead>
                            <TableHead>Delivery</TableHead>
                            <TableHead>Charges</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {user.borrowRecords.map((record) => (
                            <TableRow key={record.borrowId}>
                              {/* Book Column */}
                              <TableCell>
                                <div>
                                  <div className="font-medium">{record.bookTitle}</div>
                                  <div className="text-xs text-gray-500">{record.bookAuthor}</div>
                                  {record.bookIsbn && <div className="text-xs text-gray-500">ISBN: {record.bookIsbn}</div>}
                                </div>
                              </TableCell>
                              
                              {/* Status Column */}
                              <TableCell>
                                <Badge className={getStatusColor(record.status)}>
                                  {record.status}
                                </Badge>
                              </TableCell>
                              
                              {/* Borrow Date */}
                              <TableCell>{formatDate(record.borrowDate)}</TableCell>
                              
                              {/* Due Date */}
                              <TableCell>{formatDate(record.dueDate)}</TableCell>
                              
                              {/* Return Date */}
                              <TableCell>{formatDate(record.returnDate)}</TableCell>
                              
                              {/* Delivery Method */}
                              <TableCell>
                                <div className="text-sm">{record.deliveryMethod}</div>
                                {record.deliveryAddress && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {record.deliveryAddress.city}, {record.deliveryAddress.state}
                                  </div>
                                )}
                              </TableCell>
                              
                              {/* Charges Column */}
                              <TableCell>
                                {record.receipt ? (
                                  <div className="text-xs space-y-1">
                                    <div>
                                      <span className="text-gray-500">Base:</span> ₹{record.receipt.baseCharge.toFixed(2)}
                                    </div>
                                    {(record.receipt.extraDays ?? 0) > 0 && (
                                      <div>
                                        <span className="text-gray-500">Extra ({record.receipt.extraDays} days):</span> ₹{record.receipt.extraCharge.toFixed(2)}
                                      </div>
                                    )}
                                    <div className="font-medium">
                                      <span className="text-gray-500">Total:</span> ₹{record.receipt.totalCharge.toFixed(2)}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">No charges</span>
                                )}
                              </TableCell>
                              
                              {/* Actions Column */}
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(record);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No records found. Try adjusting your search or filters.
            </div>
          )}
        </div>
      </div>
      
      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Borrowing Record Details</DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="mt-4">
              {/* Tabs */}
              <div className="flex border-b mb-4 overflow-x-auto">
                <button
                  className={`px-4 py-2 ${activeTab === 'user' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('user')}
                >
                  <User className="h-4 w-4 inline mr-1" />
                  Member Details
                </button>
                <button
                  className={`px-4 py-2 ${activeTab === 'book' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('book')}
                >
                  <BookOpen className="h-4 w-4 inline mr-1" />
                  Book & Delivery
                </button>
                <button
                  className={`px-4 py-2 ${activeTab === 'condition' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('condition')}
                >
                  <Camera className="h-4 w-4 inline mr-1" />
                  Book Condition
                </button>
                <button
                  className={`px-4 py-2 ${activeTab === 'receipt' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('receipt')}
                >
                  <FileText className="h-4 w-4 inline mr-1" />
                  Receipt
                </button>
              </div>
              
              {/* User Tab */}
              {activeTab === 'user' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      {selectedRecord.profilePicture ? (
                        <Image 
                          src={selectedRecord.profilePicture} 
                          alt={selectedRecord.fullName}
                          width={80}
                          height={80}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">{selectedRecord.fullName}</h3>
                        <p className="text-gray-600">{selectedRecord.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2">
                        <div className="text-sm text-gray-500">University ID</div>
                        <div>{selectedRecord.universityId}</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-sm text-gray-500">University Card</div>
                        <div>{selectedRecord.universityCard}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h4 className="font-semibold">Borrowing Details</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2">
                        <div className="text-sm text-gray-500">Status</div>
                        <div><Badge className={getStatusColor(selectedRecord.status)}>{selectedRecord.status}</Badge></div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-sm text-gray-500">Request Date</div>
                        <div>{formatDate(selectedRecord.requestDate)}</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-sm text-gray-500">Borrow Date</div>
                        <div>{formatDate(selectedRecord.borrowDate)}</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-sm text-gray-500">Due Date</div>
                        <div>{formatDate(selectedRecord.dueDate)}</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-sm text-gray-500">Return Date</div>
                        <div>{formatDate(selectedRecord.returnDate)}</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-sm text-gray-500">Delivery Method</div>
                        <div>{selectedRecord.deliveryMethod}</div>
                      </div>
                      {selectedRecord.notes && (
                        <div className="grid grid-cols-2">
                          <div className="text-sm text-gray-500">Notes</div>
                          <div>{selectedRecord.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Book & Delivery Tab */}
              {activeTab === 'book' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      {selectedRecord.bookCoverUrl ? (
                        <Image 
                          src={selectedRecord.bookCoverUrl} 
                          alt={selectedRecord.bookTitle}
                          width={100}
                          height={140}
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-24 h-36 rounded bg-gray-200 flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">{selectedRecord.bookTitle}</h3>
                        <p className="text-gray-600">{selectedRecord.bookAuthor}</p>
                        {selectedRecord.bookIsbn && (
                          <p className="text-sm text-gray-500">ISBN: {selectedRecord.bookIsbn}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2">
                        <div className="text-sm text-gray-500">Library</div>
                        <div>{selectedRecord.libraryName}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h4 className="font-semibold">Delivery Address</h4>
                    {selectedRecord.deliveryAddress ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2">
                          <div className="text-sm text-gray-500">Full Name</div>
                          <div>{selectedRecord.deliveryAddress.fullName}</div>
                        </div>
                        <div className="grid grid-cols-2">
                          <div className="text-sm text-gray-500">Phone</div>
                          <div>{selectedRecord.deliveryAddress.phone}</div>
                        </div>
                        <div className="grid grid-cols-2">
                          <div className="text-sm text-gray-500">Address Line 1</div>
                          <div>{selectedRecord.deliveryAddress.addressLine1}</div>
                        </div>
                        {selectedRecord.deliveryAddress.addressLine2 && (
                          <div className="grid grid-cols-2">
                            <div className="text-sm text-gray-500">Address Line 2</div>
                            <div>{selectedRecord.deliveryAddress.addressLine2}</div>
                          </div>
                        )}
                        <div className="grid grid-cols-2">
                          <div className="text-sm text-gray-500">City</div>
                          <div>{selectedRecord.deliveryAddress.city}</div>
                        </div>
                        <div className="grid grid-cols-2">
                          <div className="text-sm text-gray-500">State</div>
                          <div>{selectedRecord.deliveryAddress.state}</div>
                        </div>
                        <div className="grid grid-cols-2">
                          <div className="text-sm text-gray-500">Zip Code</div>
                          <div>{selectedRecord.deliveryAddress.zipCode}</div>
                        </div>
                        <div className="grid grid-cols-2">
                          <div className="text-sm text-gray-500">Country</div>
                          <div>{selectedRecord.deliveryAddress.country}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        {selectedRecord.deliveryMethod === "TAKEAWAY" 
                          ? "Pickup from library (No delivery address)" 
                          : "No delivery address provided"}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Book Condition Tab */}
              {activeTab === 'condition' && (
                <div className="space-y-6">
                  {selectedRecord.conditionRecord ? (
                    <>
                      <div>
                        <h4 className="font-semibold mb-3">Before Borrowing</h4>
                        {selectedRecord.conditionRecord.beforeConditionNotes && (
                          <div className="mb-3">
                            <h5 className="text-sm text-gray-500 mb-1">Notes:</h5>
                            <p className="bg-gray-50 p-3 rounded">{selectedRecord.conditionRecord.beforeConditionNotes}</p>
                          </div>
                        )}
                        
                        <h5 className="text-sm text-gray-500 mb-2">Photos:</h5>
                        {selectedRecord.conditionRecord.beforeBorrowPhotos.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {selectedRecord.conditionRecord.beforeBorrowPhotos.map((photo, index) => (
                              <div key={`before-${index}`} className="relative aspect-square">
                                <Image 
                                  src={photo}
                                  alt={`Book condition before borrowing ${index + 1}`}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No photos available</p>
                        )}
                      </div>
                      
                      <div className="border-t pt-6">
                        <h4 className="font-semibold mb-3">After Return</h4>
                        {selectedRecord.conditionRecord.afterConditionNotes && (
                          <div className="mb-3">
                            <h5 className="text-sm text-gray-500 mb-1">Notes:</h5>
                            <p className="bg-gray-50 p-3 rounded">{selectedRecord.conditionRecord.afterConditionNotes}</p>
                          </div>
                        )}
                        
                        <h5 className="text-sm text-gray-500 mb-2">Photos:</h5>
                        {selectedRecord.conditionRecord.afterReturnPhotos.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {selectedRecord.conditionRecord.afterReturnPhotos.map((photo, index) => (
                              <div key={`after-${index}`} className="relative aspect-square">
                                <Image 
                                  src={photo}
                                  alt={`Book condition after return ${index + 1}`}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No photos available</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No condition records available for this borrowing.
                    </div>
                  )}
                </div>
              )}
              
              {/* Receipt Tab */}
              {activeTab === 'receipt' && (
                <div className="space-y-6">
                  {selectedRecord.receipt ? (
                    <div className="border rounded-lg p-6 bg-white">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-bold">{selectedRecord.libraryName}</h3>
                          <p className="text-gray-600">Receipt #{selectedRecord.receipt.id.substring(0, 8)}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                      
                      <div className="flex justify-between mb-6">
                        <div>
                          <h4 className="font-medium text-gray-700">Receipt To:</h4>
                          <p>{selectedRecord.fullName}</p>
                          <p>{selectedRecord.email}</p>
                          <p>University ID: {selectedRecord.universityId}</p>
                        </div>
                        <div className="text-right">
                          <h4 className="font-medium text-gray-700">Receipt Details:</h4>
                          <p>Receipt Type: {selectedRecord.receipt.type}</p>
                          <p>Generated: {formatDate(selectedRecord.receipt.generatedAt)}</p>
                          <p>Status: {selectedRecord.receipt.isPrinted ? 'Printed' : 'Not Printed'}</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-b py-4 mb-6">
                        <h4 className="font-medium mb-3">Book Details:</h4>
                        <div className="flex gap-3">
                          {selectedRecord.bookCoverUrl && (
                            <Image 
                              src={selectedRecord.bookCoverUrl}
                              alt={selectedRecord.bookTitle}
                              width={60}
                              height={80}
                              className="object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{selectedRecord.bookTitle}</p>
                            <p className="text-gray-600">{selectedRecord.bookAuthor}</p>
                            {selectedRecord.bookIsbn && <p className="text-sm text-gray-500">ISBN: {selectedRecord.bookIsbn}</p>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between">
                          <span>Base Charge:</span>
                          <span>₹{selectedRecord.receipt.baseCharge.toFixed(2)}</span>
                        </div>
                        
                        {selectedRecord.receipt && (selectedRecord.receipt.extraDays ?? 0) > 0 && (
                          <div className="flex justify-between">
                            <span>Extra Days ({selectedRecord.receipt.extraDays}):</span>
                            <span>₹{selectedRecord.receipt.extraCharge.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total Charge:</span>
                          <span>₹{selectedRecord.receipt.totalCharge.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {selectedRecord.receipt.notes && (
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <span className="font-medium">Notes:</span> {selectedRecord.receipt.notes}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No receipt generated for this borrowing record.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembersHistory;