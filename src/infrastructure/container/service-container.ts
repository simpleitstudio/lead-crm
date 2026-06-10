import { UserRepository } from '../repositories/user.repository';
import { LeadRepository } from '../repositories/lead.repository';
import { RemarkRepository } from '../repositories/remark.repository';
import { FollowUpRepository } from '../repositories/follow-up.repository';
import { ActivityRepository } from '../repositories/activity.repository';
import { AttachmentRepository } from '../repositories/attachment.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { TagRepository } from '../repositories/tag.repository';
import { ImportHistoryRepository } from '../repositories/import-history.repository';
import { ExportHistoryRepository } from '../repositories/export-history.repository';

import { LoggerService } from '../logging/logger.service';
import { FileStorageService } from '../storage/file-storage.service';
import { PasswordService } from '../auth/password.service';
import { JwtService } from '../auth/jwt.service';
import { CookieService } from '../auth/cookie.service';

import { UserService } from '../../application/services/user.service';
import { AuthService } from '../../application/services/auth.service';
import { LeadService } from '../../application/services/lead.service';
import { RemarkService } from '../../application/services/remark.service';
import { FollowUpService } from '../../application/services/follow-up.service';
import { ActivityService } from '../../application/services/activity.service';
import { AttachmentService } from '../../application/services/attachment.service';
import { NotificationService } from '../../application/services/notification.service';
import { AuditLogService } from '../../application/services/audit-log.service';
import { ImportService } from '../../application/services/import.service';
import { ExportService } from '../../application/services/export.service';
import { AnalyticsService } from '../../application/services/analytics.service';
import { DuplicateDetectionService } from '../../application/services/duplicate-detection.service';

class ServiceContainer {
  // Repositories
  private readonly _userRepository = new UserRepository();
  private readonly _leadRepository = new LeadRepository();
  private readonly _remarkRepository = new RemarkRepository();
  private readonly _followUpRepository = new FollowUpRepository();
  private readonly _activityRepository = new ActivityRepository();
  private readonly _attachmentRepository = new AttachmentRepository();
  private readonly _notificationRepository = new NotificationRepository();
  private readonly _auditLogRepository = new AuditLogRepository();
  private readonly _tagRepository = new TagRepository();
  private readonly _importHistoryRepository = new ImportHistoryRepository();
  private readonly _exportHistoryRepository = new ExportHistoryRepository();

  // Infrastructure services
  private readonly _loggerService = new LoggerService();
  private readonly _fileStorageService = new FileStorageService();
  private readonly _passwordService = new PasswordService();
  private readonly _jwtService = new JwtService();
  private readonly _cookieService = new CookieService();

  // Application services
  private readonly _duplicateDetectionService = new DuplicateDetectionService(this._leadRepository);
  private readonly _auditLogService = new AuditLogService(this._auditLogRepository);
  private readonly _activityService = new ActivityService(this._activityRepository);
  private readonly _notificationService = new NotificationService(this._notificationRepository, this._userRepository, this._auditLogRepository);
  private readonly _attachmentService = new AttachmentService(this._attachmentRepository, this._fileStorageService);
  private readonly _remarkService = new RemarkService(this._remarkRepository, this._leadRepository, this._activityRepository);
  private readonly _followUpService = new FollowUpService(this._followUpRepository, this._leadRepository, this._activityRepository, this._notificationRepository);
  private readonly _userService = new UserService(this._userRepository, this._passwordService);
  private readonly _authService = new AuthService(this._userRepository, this._passwordService, this._jwtService, this._auditLogRepository);
  private readonly _leadService = new LeadService(this._leadRepository, this._userRepository, this._activityRepository, this._notificationRepository, this._auditLogRepository);
  private readonly _importService = new ImportService(this._importHistoryRepository, this._leadRepository, this._auditLogRepository);
  private readonly _exportService = new ExportService(this._exportHistoryRepository, this._leadRepository, this._userRepository, this._auditLogRepository);
  private readonly _analyticsService = new AnalyticsService(this._leadRepository, this._followUpRepository, this._userRepository);

  public getUserRepository() { return this._userRepository; }
  public getLeadRepository() { return this._leadRepository; }
  public getRemarkRepository() { return this._remarkRepository; }
  public getFollowUpRepository() { return this._followUpRepository; }
  public getActivityRepository() { return this._activityRepository; }
  public getAttachmentRepository() { return this._attachmentRepository; }
  public getNotificationRepository() { return this._notificationRepository; }
  public getAuditLogRepository() { return this._auditLogRepository; }
  public getTagRepository() { return this._tagRepository; }
  public getImportHistoryRepository() { return this._importHistoryRepository; }
  public getExportHistoryRepository() { return this._exportHistoryRepository; }

  public getLoggerService() { return this._loggerService; }
  public getFileStorageService() { return this._fileStorageService; }
  public getPasswordService() { return this._passwordService; }
  public getJwtService() { return this._jwtService; }
  public getCookieService() { return this._cookieService; }

  public getDuplicateDetectionService() { return this._duplicateDetectionService; }
  public getAuditLogService() { return this._auditLogService; }
  public getActivityService() { return this._activityService; }
  public getNotificationService() { return this._notificationService; }
  public getAttachmentService() { return this._attachmentService; }
  public getRemarkService() { return this._remarkService; }
  public getFollowUpService() { return this._followUpService; }
  public getUserService() { return this._userService; }
  public getAuthService() { return this._authService; }
  public getLeadService() { return this._leadService; }
  public getImportService() { return this._importService; }
  public getExportService() { return this._exportService; }
  public getAnalyticsService() { return this._analyticsService; }
}

export const container = new ServiceContainer();
