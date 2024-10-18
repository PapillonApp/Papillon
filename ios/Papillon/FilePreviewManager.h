//
//  FilePreviewManager.h
//  Papillon
//
//  Created by imyanice on 02/10/2024.
//


#import <React/RCTBridgeModule.h>
#import <QuickLook/QuickLook.h>

@interface FilePreviewManager : NSObject <RCTBridgeModule, QLPreviewControllerDataSource>

@end
