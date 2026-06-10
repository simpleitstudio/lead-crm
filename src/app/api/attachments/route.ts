import { NextResponse } from 'next/server';
import { container } from '../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../middleware/error-handler.middleware';

export const GET = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const { searchParams } = req.nextUrl;
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    const attachmentService = container.getAttachmentService();
    const attachments = await attachmentService.getAttachmentsByLead(leadId, req.user.id, req.user.role);

    return NextResponse.json(attachments);
  })
);

export const POST = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const leadId = formData.get('leadId') as string;

    if (!file || !leadId) {
      return NextResponse.json({ error: 'file and leadId are required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop() || '';

    const attachmentService = container.getAttachmentService();
    const attachment = await attachmentService.uploadAttachment(
      leadId,
      file.name,
      fileExtension,
      file.size,
      file.type,
      buffer,
      req.user.id
    );

    return NextResponse.json(attachment, { status: 201 });
  })
);
