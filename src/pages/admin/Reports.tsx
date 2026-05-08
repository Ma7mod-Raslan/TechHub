// ============================================================
// Reports.tsx — Admin Reports & Messages (Clean Version)
// Applies: Single Responsibility, DRY
// ============================================================

import { useState, useEffect } from "react";
import { Search, Eye, Trash2, Send, Menu } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "../../components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { toast } from "sonner";
import {
  fetchAllReports, fetchReportDetails as apiFetchReportDetails,
  toggleReportStatus as apiToggleReportStatus, deleteReport,
  fetchContactMessages, deleteContactMessage, replyToContactMessage,
} from "../admin/config/adminApi";
import { getAdminMenuItems } from "../admin/config/adminMenu";

interface AdminReportsProps {
  logout: () => void;
  userRole: string;
}

interface ReportData {
  id: number;
  type: string;
  name: string;
  email: string;
  category: string;
  message: string;
  date: string;
  status: "Pending" | "Resolved";
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: "New" | "Replied" | "Pending";
}

// ─── Pure helpers ─────────────────────────────────────────────

const mapReport = (r: any): ReportData => ({
  id: r.id,
  type: r.type,
  name: r.reporter_name,
  email: r.email,
  category: r.category,
  message: r.message_excerpt,
  date: new Date(r.created_at).toLocaleString(),
  status: r.status === "pending" ? "Pending" : "Resolved",
});

const mapMessage = (msg: any): ContactMessage => ({
  id: msg.id,
  name: msg.name ?? "",
  email: msg.email ?? "",
  subject: msg.subject ?? "",
  message: msg.message_preview ?? "",
  date: (msg.created_at ?? msg.date)
    ? new Date(msg.created_at ?? msg.date).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "",
  status: msg.status === "replied" ? "Replied" : msg.status === "pending" ? "Pending" : "New",
});

const getStatusBadgeClass = (status: string): string => {
  const map: Record<string, string> = {
    New: "bg-blue-100 text-blue-700",
    Replied: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
};

// ─── Main Component ──────────────────────────────────────────

export default function AdminReports({ logout }: AdminReportsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number | null; type: "report" | "contact" }>({ show: false, id: null, type: "report" });

  const loadReports = () => fetchAllReports().then((data: any) => setReports(data.map(mapReport))).catch(console.error);
  const loadMessages = () => fetchContactMessages().then((data: any) => setContactMessages(data.map(mapMessage))).catch(console.error);

  useEffect(() => { loadReports(); loadMessages(); }, []);

  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.email.toLowerCase().includes(searchTerm.toLowerCase());
    const normalize = (s: string) => s.toLowerCase().replace(" content", "").trim();
    return matchesSearch && (categoryFilter === "all" || normalize(r.category) === normalize(categoryFilter));
  });

  const filteredMessages = contactMessages.filter((m) => {
    const matchesSearch = (m.name + m.email + m.subject).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (statusFilter === "all" || m.status === statusFilter);
  });

  const handleToggleReportStatus = async (id: number) => {
    try {
      const data: any = await apiToggleReportStatus(id);
      toast.success(data.message);
      loadReports();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    try {
      const data: any = deleteConfirm.type === "report"
        ? await deleteReport(deleteConfirm.id)
        : await deleteContactMessage(deleteConfirm.id);
      toast.success(data.message);
      deleteConfirm.type === "report" ? loadReports() : loadMessages();
    } catch (err: any) { toast.error(err.message); }
    setDeleteConfirm({ show: false, id: null, type: "report" });
  };

  const handleReplyDetails = async (id: number) => {
    try {
      const data: any = await apiFetchReportDetails(id);
      setSelectedReport({
        id: data.id, type: data.type, name: data.reporter_name, email: data.email,
        category: data.category, message: data.content,
        date: new Date(data.created_at).toLocaleString(),
        status: data.status === "pending" ? "Pending" : "Resolved",
      });
    } catch (err) { console.error(err); }
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    try {
      await replyToContactMessage(selectedMessage.id, replyText);
      toast.success("Reply sent successfully");
      setContactMessages((prev) => prev.map((m) => m.id === selectedMessage.id ? { ...m, status: "Replied" } : m));
      setShowReplyDialog(false);
      setReplyText("");
      setSelectedMessage(null);
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar menuItems={getAdminMenuItems("/admin/reports")} logout={logout} userRole="admin" activePage="admin-dashboard" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className="flex-1 w-full">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl">Reports & Messages</h1>
                <p className="text-gray-600">Review contact messages and reported content</p>
              </div>
              <HeaderIcons logout={logout} userRole="admin" currentPage="admin-reports" />
            </div>
          </header>

          <main className="p-6">
            <Tabs defaultValue="reports" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="reports">Reported Content ({reports.length})</TabsTrigger>
                <TabsTrigger value="contacts">Contact Messages ({contactMessages.length})</TabsTrigger>
              </TabsList>

              {/* Reports Tab */}
              <TabsContent value="reports">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search reported content..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Filter by category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Spam">Spam</SelectItem>
                          <SelectItem value="Harassment">Harassment</SelectItem>
                          <SelectItem value="Inappropriate Content">Inappropriate Content</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead><TableHead>From</TableHead><TableHead>Email</TableHead>
                            <TableHead>Category</TableHead><TableHead>Message Excerpt</TableHead>
                            <TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredReports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell>
                                <Badge className={report.type === "Reported Post" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}>{report.type}</Badge>
                              </TableCell>
                              <TableCell>{report.name}</TableCell>
                              <TableCell className="text-gray-600">{report.email}</TableCell>
                              <TableCell><Badge className="bg-violet-100 text-violet-700">{report.category}</Badge></TableCell>
                              <TableCell className="max-w-xs truncate">{report.message}</TableCell>
                              <TableCell className="text-gray-600">{report.date}</TableCell>
                              <TableCell>
                                <Badge className={report.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}>{report.status}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleToggleReportStatus(report.id)}
                                    className={report.status === "Pending" ? "text-green-600 border-green-200 hover:bg-green-50" : "text-gray-500 border-gray-200 hover:bg-gray-100"}>
                                    {report.status === "Pending" ? "Mark as Resolved" : "Mark as Pending"}
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="outline" onClick={() => handleReplyDetails(report.id)} className="hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Report Details</DialogTitle>
                                        <DialogDescription>Reported by {report.name} on {report.date}</DialogDescription>
                                      </DialogHeader>
                                      <div className="mt-4 space-y-4">
                                        <div className="flex gap-3 flex-wrap">
                                          <span className="text-sm text-gray-600">Type: </span>
                                          <Badge className={report.type === "Reported Post" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}>{report.type}</Badge>
                                          <span className="text-sm text-gray-600">Category: </span>
                                          <Badge className="bg-violet-100 text-violet-700">{report.category}</Badge>
                                          <span className="text-sm text-gray-600">Status: </span>
                                          <Badge className={report.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}>{report.status}</Badge>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600 mb-2">Reporter Email:</p>
                                          <p className="text-sm">{report.email}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600 mb-2">Full Report:</p>
                                          <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-700">{selectedReport?.message ?? report.message}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button size="sm" variant="outline" onClick={() => setDeleteConfirm({ show: true, id: report.id, type: "report" })} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Messages Tab */}
              <TabsContent value="contacts">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search contact messages..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Replied">Replied</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Subject</TableHead>
                            <TableHead>Message Preview</TableHead><TableHead>Date</TableHead>
                            <TableHead>Status</TableHead><TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMessages.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-6">No messages found</TableCell></TableRow>
                          ) : (
                            filteredMessages.map((message) => (
                              <TableRow key={message.id}>
                                <TableCell>{message.name}</TableCell>
                                <TableCell className="text-gray-600">{message.email}</TableCell>
                                <TableCell className="max-w-xs truncate">{message.subject}</TableCell>
                                <TableCell className="max-w-xs truncate text-gray-600">{message.message}</TableCell>
                                <TableCell className="text-gray-600">{message.date}</TableCell>
                                <TableCell><Badge className={getStatusBadgeClass(message.status)}>{message.status}</Badge></TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>Contact Message</DialogTitle>
                                          <DialogDescription>From {message.name} ({message.email}) on {message.date}</DialogDescription>
                                        </DialogHeader>
                                        <div className="mt-4 space-y-4">
                                          <div className="flex gap-3 items-center">
                                            <span className="text-sm text-gray-600">Status: </span>
                                            <Badge className={getStatusBadgeClass(message.status)}>{message.status}</Badge>
                                          </div>
                                          <div><p className="text-sm text-gray-600 mb-2">Subject:</p><p>{message.subject}</p></div>
                                          <div>
                                            <p className="text-sm text-gray-600 mb-2">Message:</p>
                                            <div className="bg-gray-50 p-4 rounded-lg"><p className="text-gray-700">{message.message}</p></div>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                    <Button size="sm" variant="outline" onClick={() => { setSelectedMessage(message); setShowReplyDialog(true); setReplyText(""); }} className="hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200">
                                      <Send className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setDeleteConfirm({ show: true, id: message.id, type: "contact" })} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm.show} onOpenChange={() => setDeleteConfirm({ show: false, id: null, type: "report" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteConfirm.type === "report" ? "Report" : "Message"}</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to permanently delete this {deleteConfirm.type === "report" ? "report" : "message"}? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Contact Message</DialogTitle>
            <DialogDescription>{selectedMessage && `To: ${selectedMessage.name} (${selectedMessage.email})`}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div><p className="text-sm text-gray-600 mb-2">Subject:</p><p className="mb-4">{selectedMessage?.subject}</p></div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Original Message:</p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4"><p className="text-gray-700 text-sm">{selectedMessage?.message}</p></div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Your Reply:</p>
              <Textarea placeholder="Type your reply here..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full h-40" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>Cancel</Button>
            <Button onClick={sendReply} disabled={!replyText.trim()} className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600">
              <Send className="h-4 w-4 mr-2" /> Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}