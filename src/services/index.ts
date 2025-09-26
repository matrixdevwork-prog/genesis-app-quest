// Export all services from a central location
export { userService } from './userService';
export { taskService } from './taskService';
export { campaignService } from './campaignService';
export { videoService } from './videoService';
export { creditService } from './creditService';
export { default as youtubeService } from './youtubeService';
export { default as gamificationService } from './gamificationService';
export { default as referralService } from './referralService';

// Export types
export type { Profile, ProfileInsert, ProfileUpdate } from './userService';
export type { Task, UserTask, Video } from './taskService';
export type { Campaign } from './campaignService';
export type { CreditTransaction } from './creditService';
export type { Achievement, XPReward, LeaderboardEntry } from './gamificationService';
export type { ReferralStats, ReferralValidation } from './referralService';