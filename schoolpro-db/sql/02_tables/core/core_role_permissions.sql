-- =====================================================================
-- TABLE: core.role_permissions
-- Mapping between roles and their granted permissions
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.role_permissions (
  role_id       UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES core.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

COMMENT ON TABLE core.role_permissions IS 'Many-to-many junction assigning permissions to security roles';
