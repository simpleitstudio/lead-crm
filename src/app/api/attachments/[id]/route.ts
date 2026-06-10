import { NextResponse } from 'next/server';
import { container } from '../../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../../middleware/error-handler.middleware';

export const GET = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest, context: any) => {
    const params = await context.params;
    const { id } = params;

    const attachmentService = container.getAttachmentService();
    const { entity, buffer } = await attachmentService.getAttachmentFile(id, req.user.id, req.user.role);

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': entity.mimeType,
        'Content-Disposition': `inline; filename="${entity.fileName}"`,
      },
    });
  })
);

export const DELETE = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest, context: any) => {
    const params = await context.params;
    const { id } = params;

    const attachmentService = container.getAttachmentService();
    await attachmentService.deleteAttachment(id, req.user.id, req.user.role);

    return NextResponse.json({ success: true });
  })
);
