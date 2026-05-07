"use client";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Lock,
  Plus,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Edit,
} from "lucide-react";
import {
  useCreateRoleMutation,
  useGetPermissionsQuery,
  useGetRolesQuery,
  useUpdateRoleMutation,
} from "@/lib/redux/services/role.api";
import toast from "react-hot-toast";
import { Modal, Form, Input } from "antd";
import { useTranslations } from "next-intl";

export default function RolesPage() {
  const t = useTranslations();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const selectedColor = Form.useWatch("color", editForm);
  // 1. Hook up the API
  const { data: roles = [], isLoading: rolesLoading } =
    useGetRolesQuery(undefined);
  const { data: allPermissions = [], isLoading: permsLoading } =
    useGetPermissionsQuery(undefined);
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();

  // 2. Component State
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isMobileViewOpen, setIsMobileViewOpen] = useState(false);
  const [activePermissionIds, setActivePermissionIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleRoleSelect = (role: any) => {
    setSelectedRole(role);
    setIsMobileViewOpen(true);
  };

  const handleTogglePermission = (slug: string) => {
    setActivePermissionIds((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    try {
      await updateRole({
        id: selectedRole.id,
        data: { permissions: activePermissionIds },
      }).unwrap();
      toast.success("Role permissions updated successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update permissions");
    }
  };

  const onCreateRoleSubmit = async (values: {
    name: string;
    description: string;
  }) => {
    try {
      await createRole({
        name: values.name,
        description: values.description,
        permissions: [],
      }).unwrap();

      toast.success("Role created successfully");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create role");
    }
  };

  const onUpdateRoleSubmit = async (values: any) => {
    try {
      await updateRole({
        id: selectedRole.id,
        data: values,
      }).unwrap();
      toast.success("Role details updated!");
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update role");
    }
  };

  // 4. Group permissions by Module for the Matrix UI
  const groupedPermissions = allPermissions.reduce((acc: any, curr: any) => {
    const moduleName = curr.module || "General";
    if (!acc[moduleName]) acc[moduleName] = [];
    acc[moduleName].push(curr);
    return acc;
  }, {});

  // 3. Sync local selection with API data
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles]);

  useEffect(() => {
    if (selectedRole) {
      setActivePermissionIds(selectedRole.permissions || []);
    }
  }, [selectedRole]);

  useEffect(() => {
    if (selectedRole && isEditModalOpen) {
      editForm.setFieldsValue({
        name: selectedRole.name,
        description: selectedRole.description,
        color: selectedRole.color || "bg-brand",
      });
    }
  }, [selectedRole, isEditModalOpen, editForm]);

  if (rolesLoading || permsLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6 md:gap-8 h-screen md:h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-fg uppercase flex items-center gap-3">
            <Lock className="text-brand" size={20} /> {t("ACCESS_CONTROL")}
          </h1>
          <p className="text-xs md:text-sm font-medium text-slate-500">
            {t("ACCESS_CONTROL_DESC")}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-fit cursor-pointer bg-brand text-white sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all"
        >
          <Plus size={16} /> {t("NEW_ROLE")}
        </button>
      </div>

      <div className="flex gap-8 overflow-hidden relative flex-1">
        {/* 1. ROLES LIST */}
        <div
          className={`${isMobileViewOpen ? "hidden md:flex" : "flex"} w-full md:w-80 flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin`}
        >
          {roles.map((role: any) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role)}
              className={`text-left p-5 rounded-4xl border transition-all relative group shrink-0 ${
                selectedRole?.id === role.id
                  ? "bg-bg border-brand shadow-xl shadow-brand/5"
                  : "bg-bg border-slate-100 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div
                  className={`h-8 w-8 rounded-xl ${role.color || "bg-brand"} flex items-center justify-center text-white`}
                >
                  <ShieldCheck size={18} />
                </div>
                <div className="flex items-center gap-4">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelect(role);
                      setIsEditModalOpen(true);
                    }}
                    className={`cursor-pointer flex items-center justify-center text-brand`}
                  >
                    <Edit size={18} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t("ADMINS")}
                    </span>
                    <span className="text-xs font-bold text-fg">
                      {role?.users?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
              <h3 className="font-black text-fg uppercase tracking-tight mb-1">
                {role.name}
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                {role.description}
              </p>
              <ChevronRight
                size={16}
                className="absolute bottom-5 right-5 text-brand md:opacity-0 md:group-hover:opacity-100 transition-all"
              />
            </button>
          ))}
        </div>

        {/* 2. PERMISSION MATRIX */}
        <div
          className={`${isMobileViewOpen ? "flex" : "hidden md:flex"} flex-1 bg-bg border border-slate-200 dark:border-slate-800 rounded-3xl md:rounded-[2.5rem] overflow-hidden flex-col shadow-sm`}
        >
          {/* Header Section */}
          <div className="p-4 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={() => setIsMobileViewOpen(false)}
              className="md:hidden flex items-center gap-2 text-brand font-black text-[10px] uppercase mb-4"
            >
              <ChevronLeft size={14} /> {t("BACK_TO_ROLES")}
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-2 h-2 rounded-full ${selectedRole?.color || "bg-brand"}`}
                  />
                  <h2 className="text-lg font-black text-fg uppercase tracking-tighter">
                    {t("PERMISSIONS_TITLE", { name: selectedRole?.name })}
                  </h2>
                </div>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium italic">
                  {t("AFFECTING_PERMISSIONS", { name: selectedRole?.name })}
                </p>
              </div>
              {selectedRole?.name !== "superadmin" && (
                <div className="flex gap-2 w-fit">
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="cursor-pointer flex-1 lg:flex-none px-8 py-2.5 bg-brand text-white rounded-xl text-xs font-bold shadow-lg shadow-brand/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isUpdating && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    {t("SAVE_CHANGES")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Matrix Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-thin">
            {Object.entries(groupedPermissions).map(
              ([moduleName, perms]: [string, any]) => {
                const isSuperAdmin = activePermissionIds.includes("*");

                return (
                  <div key={moduleName} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {moduleName}
                      </h3>
                      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-500" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      {perms.map((perm: any) => {
                        const isChecked =
                          activePermissionIds.includes(perm.slug) ||
                          isSuperAdmin;

                        return (
                          <div
                            key={perm.slug}
                            onClick={() =>
                              !isSuperAdmin && handleTogglePermission(perm.slug)
                            }
                            className={`flex flex-col gap-2 items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border transition-all ${
                              isSuperAdmin
                                ? "cursor-default border-up/20 bg-up/5"
                                : isChecked
                                  ? "border-up/30 bg-up/5 cursor-pointer"
                                  : "border-transparent cursor-pointer"
                            }`}
                          >
                            <span className="text-xs font-bold text-fg">
                              {perm.description}
                            </span>

                            {isSuperAdmin ? (
                              <div className="h-6 w-6 rounded-full bg-up flex items-center justify-center text-white shadow-lg shadow-up/20">
                                <ShieldCheck size={14} strokeWidth={3} />
                              </div>
                            ) : (
                              <label
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                                  isChecked
                                    ? "bg-up"
                                    : "bg-slate-300 dark:bg-slate-700"
                                }`}
                              >
                                <span
                                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                    isChecked
                                      ? "translate-x-5"
                                      : "translate-x-1"
                                  }`}
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* 4. ANT DESIGN MODAL */}
      <Modal
        title={
          <div className="font-black uppercase tracking-tight text-fg flex items-center gap-2">
            <Plus size={18} className="text-brand" /> {t("CREATE_ROLE_TITLE")}
          </div>
        }
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={isCreating}
        okText={t("CREATE_ROLE_BTN")}
        cancelText={t("DISCARD")}
        okButtonProps={{
          className:
            "bg-brand hover:bg-brand/90 font-bold uppercase text-[10px] h-10 px-6 rounded-xl",
        }}
        cancelButtonProps={{
          className: "font-bold uppercase text-[10px] h-10 px-6 rounded-xl",
        }}
        centered
        width={400}
        forceRender
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onCreateRoleSubmit}
          className="mt-6"
        >
          <Form.Item
            name="name"
            label={
              <span className="text-[10px] font-black uppercase text-slate-500">
                {t("ROLE_NAME")}
              </span>
            }
            rules={[{ required: true, message: t("ROLE_NAME_REQUIRED") }]}
          >
            <Input
              placeholder={t("ROLE_NAME_PLACEHOLDER")}
              className="rounded-xl h-11 font-bold"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <span className="text-[10px] font-black uppercase text-slate-500">
                {t("DESCRIPTION")}
              </span>
            }
            rules={[{ required: true, message: t("DESCRIPTION_REQUIRED") }]}
          >
            <Input.TextArea
              placeholder={t("DESCRIPTION_PLACEHOLDER")}
              className="rounded-xl font-medium"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 5. EDIT ROLE MODAL */}
      <Modal
        title={
          <div className="font-black uppercase tracking-tight text-fg flex items-center gap-2">
            <Edit size={18} className="text-brand" /> {t("EDIT_ROLE_TITLE")}
          </div>
        }
        open={isEditModalOpen}
        onOk={() => editForm.submit()}
        onCancel={() => setIsEditModalOpen(false)}
        confirmLoading={isUpdating}
        okText={t("SAVE_CHANGES")}
        okButtonProps={{
          className:
            "bg-brand hover:bg-brand/90 font-bold uppercase text-[10px] h-10 px-6 rounded-xl",
        }}
        cancelButtonProps={{
          className: "font-bold uppercase text-[10px] h-10 px-6 rounded-xl",
        }}
        centered
        width={400}
        forceRender
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={onUpdateRoleSubmit}
          className="mt-6"
        >
          <Form.Item
            name="name"
            label={
              <span className="text-[10px] font-black uppercase text-slate-500">
                {t("ROLE_NAME")}
              </span>
            }
            rules={[{ required: true }]}
          >
            <Input className="rounded-xl h-11 font-bold" />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <span className="text-[10px] font-black uppercase text-slate-500">
                {t("DESCRIPTION")}
              </span>
            }
            rules={[{ required: true }]}
          >
            <Input.TextArea className="rounded-xl font-medium" rows={3} />
          </Form.Item>

          <Form.Item
            name="color"
            label={
              <span className="text-[10px] font-black uppercase text-slate-500">
                {t("ROLE_IDENTITY_COLOR")}
              </span>
            }
          >
            <div className="flex flex-wrap gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl">
              {[
                { key: "bg-brand", label: t("COLOR_BLUE") },
                { key: "bg-up", label: t("COLOR_GREEN") },
                { key: "bg-orange-500", label: t("COLOR_ORANGE") },
                { key: "bg-slate-500", label: t("COLOR_GRAY") },
                { key: "bg-red-500", label: t("COLOR_RED") },
                { key: "bg-purple-500", label: t("COLOR_PURPLE") },
              ].map((c) => (
                <div
                  key={c.key}
                  onClick={() => editForm.setFieldValue("color", c.key)}
                  className={`
                    w-8 h-8 rounded-full cursor-pointer transition-all border-4
                    ${c.key} 
                    ${selectedColor === c.key ? "border-white dark:border-slate-800 scale-125 shadow-lg" : "border-transparent opacity-60"}
                  `}
                />
              ))}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
