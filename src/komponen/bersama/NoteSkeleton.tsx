import React from 'react';

export const NoteSkeleton = () => {
    return (
        <div className="ios-list-group animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
                <React.Fragment key={i}>
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                            <div className="h-4 bg-primary/10 rounded-md w-1/3 mb-2"></div>
                            <div className="h-3 bg-primary/5 rounded-md w-2/3"></div>
                        </div>
                        <div className="w-4 h-4 bg-primary/5 rounded-full"></div>
                    </div>
                    {i < 5 && <div className="ios-separator"></div>}
                </React.Fragment>
            ))}
        </div>
    );
};
