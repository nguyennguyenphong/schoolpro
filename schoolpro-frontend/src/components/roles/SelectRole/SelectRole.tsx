import React, { useMemo, useCallback } from "react";
import { Select } from "@/components/ui/Select";
import type { SelectProps } from "@/components/ui/Select";
import { Tag } from "@/components/ui/Tag";
import { Spin } from "@/components/ui/Spin";
import type {
  SelectRoleProps,
  RoleItem,
} from "@/components/roles/SelectRole/types";
import { useRoles } from "@/components/roles/SelectRole/hooks/useRoles";

/**
 * Enterprise-grade Select component for choosing roles.
 * Built on top of @/components/ui/Select with dynamic backend loading,
 * search filtering by name/code, color badges, and full accessibility.
 */
export const SelectRole: React.FC<SelectRoleProps> = ({
  valueField = "id",
  filterActiveOnly = true,
  showBadge = true,
  showDescription = false,
  showUserCount = false,
  customRoles,
  onRoleChange,
  placeholder = "Chọn vai trò",
  allowClear = true,
  showSearch = true,
  disabled = false,
  onChange,
  className = "",
  style,
  mode,
  ...restProps
}) => {
  const { roles, isLoading } = useRoles({
    filterActiveOnly,
    initialRoles: customRoles,
    enabled: !customRoles || customRoles.length === 0,
  });

  // Map roles to select options
  const options = useMemo(() => {
    return roles.map((role) => {
      const val = valueField === "code" ? role.code : role.id;
      return {
        value: val,
        title: `${role.name} (${role.code})`,
        role,
        label: (
          <div className="flex flex-col py-0.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                {showBadge && (
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: role.badge_color || "#3B82F6" }}
                    aria-hidden="true"
                  />
                )}
                <span className="font-medium text-gray-850 truncate">
                  {role.name}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono shrink-0">
                  {role.code}
                </span>
              </div>
              {showUserCount && role.user_count !== undefined && (
                <span className="text-xs text-gray-400 shrink-0 ml-1">
                  {role.user_count} users
                </span>
              )}
            </div>
            {showDescription && role.description && (
              <span className="text-xs text-gray-400 truncate mt-0.5">
                {role.description}
              </span>
            )}
          </div>
        ),
      };
    });
  }, [roles, valueField, showBadge, showDescription, showUserCount]);

  // Search filter across role name, code, and description
  const handleFilterOption = useCallback(
    (input: string, option?: (typeof options)[number]) => {
      if (!option?.role) return false;
      const query = input.toLowerCase().trim();
      const role: RoleItem = option.role;
      return (
        role.name.toLowerCase().includes(query) ||
        role.code.toLowerCase().includes(query) ||
        Boolean(
          role.description && role.description.toLowerCase().includes(query),
        )
      );
    },
    [],
  );

  // Tag renderer for multi-select mode with badge colors
  const customTagRender: NonNullable<SelectProps["tagRender"]> = (props) => {
    const { label, value, closable, onClose } = props;
    const role = roles.find((r) =>
      valueField === "code" ? r.code === value : r.id === value,
    );
    const color = role?.badge_color || "#3B82F6";

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    return (
      <Tag
        color={color}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{
          marginRight: 4,
          display: "inline-flex",
          alignItems: "center",
          borderRadius: 4,
        }}
      >
        {role ? role.name : label}
      </Tag>
    );
  };

  // Change handler to invoke standard onChange and entity onRoleChange
  const handleChange = (val: any, opt: any) => {
    if (onChange) {
      onChange(val, opt);
    }

    if (onRoleChange) {
      if (Array.isArray(val)) {
        const selected = val
          .map((v) =>
            roles.find((r) =>
              valueField === "code" ? r.code === v : r.id === v,
            ),
          )
          .filter(Boolean) as RoleItem[];
        onRoleChange(selected);
      } else if (val !== undefined && val !== null) {
        const selected = roles.find((r) =>
          valueField === "code" ? r.code === val : r.id === val,
        );
        onRoleChange(selected || null);
      } else {
        onRoleChange(null);
      }
    }
  };

  // Resolve search configuration using non-deprecated showSearch object syntax
  const resolvedShowSearch = useMemo(() => {
    if (!showSearch) return false;
    return {
      filterOption: handleFilterOption,
      ...(typeof showSearch === "object" ? showSearch : {}),
    };
  }, [showSearch, handleFilterOption]);

  return (
    <Select
      {...restProps}
      mode={mode}
      disabled={disabled || isLoading}
      loading={isLoading}
      showSearch={resolvedShowSearch}
      allowClear={allowClear}
      placeholder={placeholder}
      options={options}
      tagRender={mode ? customTagRender : undefined}
      onChange={handleChange}
      className={`schoolpro-select-role w-full ${className}`.trim()}
      style={style}
      notFoundContent={
        isLoading ? (
          <div className="flex items-center justify-center p-3 text-gray-500 gap-2">
            <Spin size="small" />
            <span className="text-xs">Đang tải dữ liệu vai trò...</span>
          </div>
        ) : undefined
      }
    />
  );
};

SelectRole.displayName = "SelectRole";
