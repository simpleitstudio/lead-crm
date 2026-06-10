import { NextResponse } from 'next/server';
import { container } from '../../../infrastructure/container/service-container';
import { withRoles } from '../../../middleware/rbac.middleware';
import { withErrorHandling } from '../../../middleware/error-handler.middleware';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { PaginationVo } from '../../../domain/value-objects/pagination.vo';
import { AuditActionType } from '../../../domain/enums/audit-action-type.enum';

export const GET = withErrorHandling(
  withRoles([UserRole.ADMIN], async (req: AuthenticatedRequest) => {
    const { searchParams } = req.nextUrl;

    const userId = searchParams.get('userId') || undefined;
    const actionType = (searchParams.get('actionType') as AuditActionType) || undefined;
    const entityType = searchParams.get('entityType') || undefined;
    const entityId = searchParams.get('entityId') || undefined;

    const dateFromStr = searchParams.get('dateFrom');
    const dateToStr = searchParams.get('dateTo');
    const dateFrom = dateFromStr ? new Date(dateFromStr) : undefined;
    const dateTo = dateToStr ? new Date(dateToStr) : undefined;

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const pagination = new PaginationVo(page, limit);

    const auditLogService = container.getAuditLogService();
    const result = await auditLogService.getAuditLogs(
      { userId, actionType, entityType, entityId, dateFrom, dateTo },
      pagination,
      req.user.id,
      req.user.role
    );

    return NextResponse.json(result);
  })
);
