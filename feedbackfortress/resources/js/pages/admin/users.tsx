import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Users() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="User Management" />
            <div className="container py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <Button>Add New User</Button>
                </div>

                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                            <CardDescription>
                                Manage system users and their roles
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex items-center gap-4">
                                <div className="flex-1">
                                    <Input
                                        type="search"
                                        placeholder="Search users..."
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="role-filter">Role:</Label>
                                    <select
                                        id="role-filter"
                                        className="rounded-md border border-input bg-background px-3 py-2"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
} 