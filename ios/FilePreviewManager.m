//
//  FilePreviewManager.m
//  Papillon
//
//  Created by imyanice on 02/10/2024.
//

#import <React/RCTBridgeModule.h>
#import <QuickLook/QuickLook.h>

@interface FilePreviewManager : NSObject <RCTBridgeModule, QLPreviewControllerDataSource>
@property (nonatomic, strong) NSURL *fileURL;
@end

@implementation FilePreviewManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(openFile:(NSString *)filePath)
{

  if ([filePath hasPrefix:@"file://"]) {
      filePath = [filePath stringByReplacingOccurrencesOfString:@"file://" withString:@""];
  }
  self.fileURL = [NSURL fileURLWithPath:filePath];
  if ([[NSFileManager defaultManager] fileExistsAtPath:filePath] ) {
    dispatch_async(dispatch_get_main_queue(), ^{
      QLPreviewController *previewController = [[QLPreviewController alloc] init];
      previewController.dataSource = self;

      UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
      if (rootViewController.presentedViewController) {
          [rootViewController.presentedViewController dismissViewControllerAnimated:YES completion:^{
              [rootViewController presentViewController:previewController animated:YES completion:nil];
          }];
      } else {
          [rootViewController presentViewController:previewController animated:YES completion:nil];
      }
    });
  } else {
    NSLog(@"File doesn't exist at path: %@", filePath);
  }
   
}

- (NSInteger)numberOfPreviewItemsInPreviewController:(QLPreviewController *)controller {
  return 1;
}

- (id<QLPreviewItem>)previewController:(QLPreviewController *)controller previewItemAtIndex:(NSInteger)index {
  return self.fileURL;
}

@end
